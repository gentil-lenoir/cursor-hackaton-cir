# Backend Requirements for Worker Mobile App

This document describes **all Laravel backend changes** needed to support the React Native worker app in `workers_app/`. The mobile app currently uses mocked APIs (`api/client.ts` with `USE_MOCK = true`). **Do not modify the Laravel folder from the mobile team** — hand this README to the backend team.

---

## Summary of gaps vs. current API

The existing Laravel worker API (`routes/api.php`, `WorkerController.php`) was built for the **web worker portal** and differs from the mobile spec in several important ways:

| Area | Current backend | Mobile app needs |
|------|-----------------|------------------|
| Auth | Email + password (`POST /api/login`) | Phone OTP (`+250` + 9 digits) |
| Task status values | `reported`, `in_progress`, `resolved` | `todo`, `in_progress`, `review`, `blocked`, `done` |
| Status transitions | Worker can set `in_progress` or `resolved` | Strict FSM (see below); worker **cannot** set `done` |
| Progress updates | Notes on status change only | Separate timeline entity with body (min 10 chars) + optional photo |
| Task steps | Not implemented | ClickUp-style checklist with admin/worker steps |
| Internal comments | Public comments on issues | Private worker↔admin thread + clarification flag |
| Review gate | None | Moving to `review` requires ≥1 progress update |

---

## 1. Authentication — Phone OTP

Workers must log in with **phone number OTP**, not email/password.

### New endpoints

```
POST /api/worker/auth/otp/request
POST /api/worker/auth/otp/verify
```

#### `POST /api/worker/auth/otp/request`

**Request:**
```json
{
  "phone": "+250788123456"
}
```

**Validation:**
- Required, string
- Regex: `^\+250\d{9}$`

**Behavior:**
- Look up active worker by `workers.phone`
- Generate 6-digit OTP, store hashed with 5-minute expiry (cache or `worker_otp_codes` table)
- Send SMS via provider (Africa's Talking, Twilio, etc.) — mock in dev with log channel
- Return 404 if phone not registered or worker inactive

**Response (200):**
```json
{
  "message": "OTP sent successfully."
}
```

#### `POST /api/worker/auth/otp/verify`

**Request:**
```json
{
  "phone": "+250788123456",
  "code": "123456"
}
```

**Response (200):**
```json
{
  "message": "Login successful.",
  "data": {
    "token": "1|abc...",
    "worker": {
      "id": "1",
      "name": "Jean Baptiste Uwimana",
      "phone": "+250788123456",
      "department": "Roads & Infrastructure"
    }
  }
}
```

**Notes:**
- Issue Sanctum token on `Worker` model (already uses `HasApiTokens`)
- Keep existing email/password login for admin/municipal manager only
- Update `auth:sanctum` guard to resolve `Worker` from OTP login

---

## 2. Task model alignment

The mobile app expects a **Task** resource shaped as follows (maps from `Issue` + related tables):

```typescript
type Task = {
  id: string;
  issue: {
    title: string;
    description: string;
    district: string;           // map from address or new district field
    category: 'roads' | 'water' | 'electricity' | 'sanitation' | 'health' | 'education' | 'security' | 'environment' | 'other';
    photos: string[];
    latitude?: number;
    longitude?: number;
  };
  status: 'todo' | 'in_progress' | 'review' | 'blocked' | 'done';
  due_date?: string;            // ISO 8601 — map from issues.deadline
  admin_notes?: string;         // new field or assignment notes
  steps: TaskStep[];
  updates: ProgressUpdate[];
  comments: InternalComment[];
};
```

### Database migrations needed

#### 2.1 Update `issues.status` enum

Replace or migrate current statuses to:

```
todo | in_progress | review | blocked | done
```

**Migration mapping suggestion:**
- `reported` → `todo`
- `assigned` → `todo`
- `in_progress` → `in_progress`
- `resolved` → `done` (admin-approved only going forward)

#### 2.2 New table: `task_steps`

```php
Schema::create('task_steps', function (Blueprint $table) {
    $table->id();
    $table->foreignId('issue_id')->constrained()->cascadeOnDelete();
    $table->string('title');
    $table->boolean('is_completed')->default(false);
    $table->timestamp('completed_at')->nullable();
    $table->enum('added_by', ['admin', 'worker']);
    $table->unsignedInteger('order');
    $table->timestamps();
});
```

#### 2.3 New table: `task_progress_updates`

```php
Schema::create('task_progress_updates', function (Blueprint $table) {
    $table->id();
    $table->foreignId('issue_id')->constrained()->cascadeOnDelete();
    $table->foreignId('worker_id')->constrained('workers');
    $table->text('body');                    // min 10 chars validated in controller
    $table->string('photo_path')->nullable();
    $table->string('photo_url')->nullable();
    $table->timestamps();
});
```

**Visibility:** Not exposed to citizen API — worker and admin only.

#### 2.4 New table: `task_internal_comments`

```php
Schema::create('task_internal_comments', function (Blueprint $table) {
    $table->id();
    $table->foreignId('issue_id')->constrained()->cascadeOnDelete();
    $table->enum('author_type', ['worker', 'admin']);
    $table->unsignedBigInteger('author_id');   // polymorphic or separate FKs
    $table->text('body');
    $table->enum('type', ['comment', 'clarification_request'])->default('comment');
    $table->timestamps();
});
```

**Do not reuse** the existing public `comments` table — citizens must not see these.

#### 2.5 Optional: `issues.admin_notes`

```php
$table->text('admin_notes')->nullable();
$table->string('district')->nullable();  // if not derivable from address
```

---

## 3. Status transition rules (enforce server-side)

Workers may **only** make these transitions:

| From | To (worker allowed) |
|------|---------------------|
| `todo` | `in_progress`, `blocked` |
| `in_progress` | `review`, `blocked`, `todo` |
| `blocked` | `in_progress` |
| `review` | *(none — admin only)* |
| `done` | *(none)* |

**Additional rules:**
1. Worker **cannot** set status to `done` — only admin/municipal manager via admin panel
2. Transition `in_progress` → `review` requires **at least one** `task_progress_updates` row for that issue
3. Return `422` with clear message if rules violated

**Suggested validation in controller:**
```php
private const WORKER_TRANSITIONS = [
    'todo' => ['in_progress', 'blocked'],
    'in_progress' => ['review', 'blocked', 'todo'],
    'blocked' => ['in_progress'],
    'review' => [],
    'done' => [],
];
```

---

## 4. New / updated API endpoints

Replace or extend current worker routes:

### Current (web)
```
GET  /api/worker/issues
POST /api/worker/issues/{issue}/status   // only in_progress | resolved
```

### Required (mobile)

```
GET    /api/worker/tasks
GET    /api/worker/tasks/{id}
PATCH  /api/worker/tasks/{id}/status
PATCH  /api/worker/tasks/{id}/steps/{stepId}    // toggle is_completed
POST   /api/worker/tasks/{id}/steps             // worker adds step
POST   /api/worker/tasks/{id}/updates           // progress update (multipart)
POST   /api/worker/tasks/{id}/comments          // internal comment
```

All routes: `auth:sanctum` + `role:worker`.

### 4.1 `GET /api/worker/tasks`

Returns all tasks assigned to authenticated worker.

**Response:**
```json
{
  "message": "Tasks fetched successfully.",
  "data": {
    "tasks": [ /* Task[] */ ]
  }
}
```

### 4.2 `GET /api/worker/tasks/{id}`

Single task with steps, updates, comments eager-loaded.

**Authorization:** `issue.worker_id === auth worker id`

### 4.3 `PATCH /api/worker/tasks/{id}/status`

**Request:**
```json
{
  "status": "review"
}
```

**Validation:**
- Status in allowed transitions from current status
- If target is `review`, assert `task_progress_updates` count ≥ 1

**Response:**
```json
{
  "message": "Status updated.",
  "data": { "task": { /* full Task object */ } }
}
```

### 4.4 `PATCH /api/worker/tasks/{id}/steps/{stepId}`

Toggle `is_completed`, set/clear `completed_at`.

**Response:** Full updated `Task`.

### 4.5 `POST /api/worker/tasks/{id}/steps`

**Request:**
```json
{
  "title": "Verify water pressure after repair"
}
```

Creates step with `added_by = worker`, `order = max + 1`.

### 4.6 `POST /api/worker/tasks/{id}/updates`

**Request:** `multipart/form-data`
- `body` (required, string, min:10)
- `photo` (optional, image, max 5MB)

Store photo on `public` disk like existing `IssueImage` flow.

### 4.7 `POST /api/worker/tasks/{id}/comments`

**Request:**
```json
{
  "body": "Which shut-off valve should I use?",
  "type": "clarification_request"
}
```

`type`: `comment` | `clarification_request`

---

## 5. Admin-side requirements

For the full workflow to work, admin panel must support:

1. **Assign issue to worker** — sets status to `todo` (already partially exists via `AssignmentController`)
2. **Add admin checklist steps** when assigning or editing an issue
3. **Approve review → done** — admin-only transition from `review` to `done`
4. **View/respond to internal comments** and clarification requests (flagged in UI)
5. **Add admin_notes** visible to worker on task detail

---

## 6. Serializer / Resource

Create `TaskResource` (or extend `IssueResource`) that outputs the exact mobile shape:

```php
return [
    'id' => (string) $issue->id,
    'issue' => [
        'title' => $issue->title,
        'description' => $issue->description,
        'district' => $issue->district ?? $this->extractDistrict($issue->address),
        'category' => $issue->category,
        'photos' => $issue->images->pluck('image_url'),
        'latitude' => $issue->latitude,
        'longitude' => $issue->longitude,
    ],
    'status' => $issue->status,
    'due_date' => $issue->deadline?->toIso8601String(),
    'admin_notes' => $issue->admin_notes,
    'steps' => TaskStepResource::collection($issue->steps),
    'updates' => ProgressUpdateResource::collection($issue->progressUpdates),
    'comments' => InternalCommentResource::collection($issue->internalComments),
];
```

---

## 7. Connecting the mobile app

Once backend is ready:

1. Set `USE_MOCK = false` in `workers_app/api/client.ts`
2. Set `EXPO_PUBLIC_API_URL` to your Laravel API (e.g. `http://192.168.x.x:8000/api` for device testing)
3. Ensure CORS allows mobile requests if using web preview
4. Run `php artisan storage:link` for progress update photos

---

## 8. Backward compatibility

Keep existing web worker endpoints working during transition:

- Option A: Alias `/api/worker/issues` → same handler as `/api/worker/tasks` with response transformer
- Option B: Maintain both; map old `resolved` ↔ new `done` in web portal JS

Document the status migration in a shared changelog for all four hackathon teams.

---

## 9. Test checklist for backend team

- [ ] OTP request/verify with valid +250 phone
- [ ] OTP rejected for invalid phone format
- [ ] Worker receives only their assigned tasks
- [ ] Status transition `todo → in_progress` succeeds
- [ ] Status transition `in_progress → review` **fails** without progress update
- [ ] Status transition `in_progress → review` **succeeds** after posting update
- [ ] Worker cannot set status to `done` (403/422)
- [ ] Admin can set `review → done`
- [ ] Step toggle persists `completed_at`
- [ ] Worker can add new step
- [ ] Progress update rejects body < 10 chars
- [ ] Internal comments not returned in citizen `/api/issues/{id}` response
- [ ] Clarification request stored with correct `type`

---

## Contact

Mobile app mock data lives in `workers_app/api/mockData.ts` — use it as the canonical shape reference for seeders and API responses.
