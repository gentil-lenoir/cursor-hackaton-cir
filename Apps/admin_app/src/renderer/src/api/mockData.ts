import type {
  ActivityLogEntry,
  AdminSettings,
  AnalyticsOverview,
  CreateTaskPayload,
  FlaggedComment,
  Issue,
  IssueComment,
  IssueStatus,
  Task,
  TaskComment,
  TaskDetail,
  TaskStep,
  UpdateAdminSettingsPayload,
  UpdateTaskPayload,
  User,
  Worker
} from '@/types'

/** Demo admin credentials — use while the Laravel API is not yet available. */
export const DEMO_ADMIN_EMAIL = 'admin@cir.rw'
export const DEMO_ADMIN_PASSWORD = 'password'
export const DEMO_ADMIN_PHONE = '+250788123456'
export const DEMO_ADMIN_OTP = '123456'

export const DEMO_ADMIN: User = {
  id: 1,
  name: 'Jean Mukamana',
  phone: DEMO_ADMIN_PHONE,
  email: DEMO_ADMIN_EMAIL,
  role: 'admin',
  status: 'active',
  language: 'en'
}

export const DEMO_ISSUES: Issue[] = [
  {
    id: 1,
    reference_number: 'CIR-2026-00001',
    reporter_name: 'Eric Nshimiyimana',
    title: 'Large pothole on KG 11 Ave near market',
    description:
      'There is a deep pothole near the market causing accidents for vehicles and pedestrians. It has been growing for weeks.',
    district: 'Gasabo',
    sector: 'Remera',
    status: 'submitted',
    citizen_priority: 4,
    ai_priority: 4,
    ai_category: 'roads',
    ai_summary:
      'Deep pothole on KG 11 Ave near market in Gasabo. Safety hazard for vehicles and pedestrians.',
    ai_tags: ['pothole', 'accident-risk', 'market-area'],
    ai_confidence: 0.87,
    community_score: 12,
    final_priority: 4.2,
    admin_priority_override: null,
    latitude: -1.9441,
    longitude: 30.0619,
    resolved_at: null,
    created_at: '2026-07-01T08:30:00Z',
    updated_at: '2026-07-01T09:15:00Z'
  },
  {
    id: 2,
    reference_number: 'CIR-2026-00002',
    reporter_name: 'Marie Uwase',
    title: 'Broken water pipe flooding street in Kicukiro',
    description: 'A main water pipe burst on Friday. Water is flooding the road and entering nearby homes.',
    district: 'Kicukiro',
    sector: 'Niboye',
    status: 'under_review',
    citizen_priority: 5,
    ai_priority: 5,
    ai_category: 'water',
    ai_summary: 'Burst water main in Kicukiro causing flooding and property damage. Urgent repair needed.',
    ai_tags: ['burst-pipe', 'flooding', 'water-supply'],
    ai_confidence: 0.92,
    community_score: 18,
    final_priority: 4.8,
    admin_priority_override: null,
    latitude: -1.9891,
    longitude: 30.1122,
    resolved_at: null,
    created_at: '2026-07-02T14:20:00Z',
    updated_at: '2026-07-02T15:00:00Z'
  },
  {
    id: 3,
    reference_number: 'CIR-2026-00003',
    reporter_name: 'Anonymous Citizen',
    title: 'Uncollected garbage near Nyabugogo bus station',
    description: 'Garbage has not been collected for over a week. Bad smell and rats in the area.',
    district: 'Nyarugenge',
    sector: 'Nyakabanda',
    status: 'assigned',
    citizen_priority: 3,
    ai_priority: 3,
    ai_category: 'sanitation',
    ai_summary: 'Uncollected waste near Nyabugogo bus station posing health and sanitation risks.',
    ai_tags: ['garbage', 'sanitation', 'bus-station'],
    ai_confidence: 0.81,
    community_score: 7,
    final_priority: 3.1,
    admin_priority_override: null,
    latitude: -1.9397,
    longitude: 30.0444,
    resolved_at: null,
    created_at: '2026-06-28T10:00:00Z',
    updated_at: '2026-07-03T11:30:00Z'
  },
  {
    id: 4,
    reference_number: 'CIR-2026-00004',
    reporter_name: 'Patrick Habimana',
    title: 'Street lights not working on KN 3 Rd',
    description: 'Multiple street lights have been out for two weeks. Area is very dark at night.',
    district: 'Gasabo',
    sector: 'Kimironko',
    status: 'in_progress',
    citizen_priority: 3,
    ai_priority: 2,
    ai_category: 'electricity',
    ai_summary: 'Multiple street lights out on KN 3 Rd in Gasabo. Safety concern for nighttime pedestrians.',
    ai_tags: ['street-lights', 'safety', 'nighttime'],
    ai_confidence: 0.75,
    community_score: 4,
    final_priority: 2.8,
    admin_priority_override: 3,
    latitude: -1.9706,
    longitude: 30.1044,
    resolved_at: null,
    created_at: '2026-06-25T18:45:00Z',
    updated_at: '2026-07-04T09:00:00Z'
  },
  {
    id: 5,
    reference_number: 'CIR-2026-00005',
    reporter_name: 'Claire Mutoni',
    title: 'Damaged bridge railing in Huye district',
    description: 'The railing on the small bridge near the university is broken. Students use this path daily.',
    district: 'Huye',
    sector: 'Tumba',
    status: 'resolved',
    citizen_priority: 4,
    ai_priority: 4,
    ai_category: 'roads',
    ai_summary: 'Broken bridge railing in Huye near university campus. Risk of falls for daily commuters.',
    ai_tags: ['bridge', 'safety', 'university'],
    ai_confidence: 0.88,
    community_score: 9,
    final_priority: 4.0,
    admin_priority_override: null,
    latitude: -2.5967,
    longitude: 29.7386,
    resolved_at: '2026-07-04T16:00:00Z',
    created_at: '2026-06-20T07:30:00Z',
    updated_at: '2026-07-04T16:00:00Z'
  }
]

export const DEMO_COMMENTS: Record<number, IssueComment[]> = {
  1: [
    {
      id: 1,
      user_id: 10,
      body: 'I drive through this area daily — the pothole is getting worse.',
      created_at: '2026-07-01T12:00:00Z'
    },
    {
      id: 2,
      user_id: 11,
      body: 'A motorcycle almost crashed here yesterday evening.',
      created_at: '2026-07-02T08:30:00Z'
    }
  ],
  2: [
    {
      id: 3,
      user_id: 12,
      body: 'Water has entered my ground floor. Please hurry.',
      created_at: '2026-07-02T16:00:00Z'
    }
  ]
}

export const DEMO_ACTIVITY: Record<number, ActivityLogEntry[]> = {
  1: [
    {
      id: 1,
      user_id: null,
      action: 'Issue submitted',
      metadata: { status: 'submitted' },
      created_at: '2026-07-01T08:30:00Z'
    },
    {
      id: 2,
      user_id: null,
      action: 'AI triage completed',
      metadata: { ai_category: 'roads', ai_priority: 4 },
      created_at: '2026-07-01T09:15:00Z'
    }
  ],
  2: [
    {
      id: 3,
      user_id: 1,
      action: 'Status changed to under_review',
      metadata: { from: 'submitted', to: 'under_review' },
      created_at: '2026-07-02T15:00:00Z'
    }
  ]
}

export const DEMO_WORKERS: Worker[] = [
  { id: 2, name: 'Emmanuel Niyonsaba', phone: '+250788111222', status: 'active', active_task_count: 2 },
  { id: 3, name: 'Grace Uwimana', phone: '+250788333444', status: 'active', active_task_count: 1 },
  { id: 4, name: 'David Nkurunziza', phone: '+250788555666', status: 'invited', active_task_count: 0 }
]

export const DEMO_TASKS: Task[] = [
  {
    id: 101,
    issue_id: 3,
    issue_title: 'Uncollected garbage near Nyabugogo bus station',
    issue_reference: 'CIR-2026-00003',
    district: 'Nyarugenge',
    assigned_to: 2,
    assigned_to_name: 'Emmanuel Niyonsaba',
    title: 'Sanitation cleanup — Nyabugogo',
    admin_notes: 'Coordinate with district sanitation team.',
    status: 'in_progress',
    due_date: '2026-07-10',
    created_at: '2026-07-03T11:30:00Z',
    updated_at: '2026-07-04T08:00:00Z'
  },
  {
    id: 102,
    issue_id: 4,
    issue_title: 'Street lights not working on KN 3 Rd',
    issue_reference: 'CIR-2026-00004',
    district: 'Gasabo',
    assigned_to: 3,
    assigned_to_name: 'Grace Uwimana',
    title: 'Repair street lights — KN 3 Rd',
    admin_notes: 'Check transformer box near junction.',
    status: 'todo',
    due_date: '2026-07-12',
    created_at: '2026-07-04T09:00:00Z',
    updated_at: '2026-07-04T09:00:00Z'
  }
]

export function filterDemoIssues(params: {
  search?: string
  status?: string
  district?: string
}): Issue[] {
  let results = [...getDemoIssues()]

  if (params.status) {
    results = results.filter((issue) => issue.status === params.status)
  }

  if (params.district) {
    const q = params.district.toLowerCase()
    results = results.filter((issue) => issue.district.toLowerCase().includes(q))
  }

  if (params.search) {
    const q = params.search.toLowerCase()
    results = results.filter(
      (issue) =>
        issue.title.toLowerCase().includes(q) ||
        issue.reference_number.toLowerCase().includes(q) ||
        issue.description.toLowerCase().includes(q)
    )
  }

  return results.sort((a, b) => b.final_priority - a.final_priority)
}

/** In-memory copy for mock updates during a session. */
let mockIssueStore: Issue[] | null = null
let mockActivityStore: Record<number, ActivityLogEntry[]> | null = null
let mockTaskStore: Task[] | null = null
let mockWorkerStore: Worker[] | null = null
let mockTaskStepsStore: Record<number, TaskStep[]> | null = null
let mockTaskCommentsStore: Record<number, TaskComment[]> | null = null
let nextTaskId = 103
let nextWorkerId = 5
let nextTaskStepId = 20
let nextTaskCommentId = 10
let nextActivityId = 100

export function getDemoIssues(): Issue[] {
  if (!mockIssueStore) {
    mockIssueStore = DEMO_ISSUES.map((issue) => ({ ...issue }))
  }
  return mockIssueStore
}

function getDemoActivityStore(): Record<number, ActivityLogEntry[]> {
  if (!mockActivityStore) {
    mockActivityStore = Object.fromEntries(
      Object.entries(DEMO_ACTIVITY).map(([k, v]) => [Number(k), v.map((e) => ({ ...e }))])
    )
  }
  return mockActivityStore
}

export function getDemoActivity(issueId: number): ActivityLogEntry[] {
  return getDemoActivityStore()[issueId] ?? []
}

export function appendDemoActivity(
  issueId: number,
  action: string,
  userId: number | null = 1,
  metadata: Record<string, unknown> | null = null
): void {
  const store = getDemoActivityStore()
  const entry: ActivityLogEntry = {
    id: nextActivityId++,
    user_id: userId,
    action,
    metadata,
    created_at: new Date().toISOString()
  }
  store[issueId] = [...(store[issueId] ?? []), entry]
}

export function getDemoTasks(): Task[] {
  if (!mockTaskStore) {
    mockTaskStore = DEMO_TASKS.map((task) => ({ ...task }))
  }
  return mockTaskStore
}

export function getDemoWorkers(): Worker[] {
  if (!mockWorkerStore) {
    mockWorkerStore = DEMO_WORKERS.map((worker) => ({ ...worker }))
  }
  return mockWorkerStore
}

export function updateDemoIssue(
  id: number,
  payload: { status?: string; admin_priority_override?: number | null }
): Issue {
  const issues = getDemoIssues()
  const index = issues.findIndex((issue) => issue.id === id)
  if (index === -1) {
    throw new Error('Issue not found')
  }

  const current = issues[index]
  const newStatus = (payload.status as Issue['status']) ?? current.status
  const newOverride =
    payload.admin_priority_override !== undefined
      ? payload.admin_priority_override
      : current.admin_priority_override

  const updated: Issue = {
    ...current,
    status: newStatus,
    admin_priority_override: newOverride,
    final_priority: newOverride ?? current.final_priority,
    updated_at: new Date().toISOString()
  }

  if (payload.status && payload.status !== current.status) {
    appendDemoActivity(id, `Status changed to ${payload.status}`, 1, {
      from: current.status,
      to: payload.status
    })
  }

  if (
    payload.admin_priority_override !== undefined &&
    payload.admin_priority_override !== current.admin_priority_override
  ) {
    appendDemoActivity(id, `Priority override set to ${payload.admin_priority_override}`, 1, {
      admin_priority_override: payload.admin_priority_override
    })
  }

  issues[index] = updated
  return updated
}

export function createDemoTask(payload: CreateTaskPayload): Task {
  const issue = getDemoIssues().find((item) => item.id === payload.issue_id)
  if (!issue) throw new Error('Issue not found')

  const worker = getDemoWorkers().find((w) => w.id === payload.assigned_to)
  if (!worker || worker.status !== 'active') {
    throw new Error('Worker not found or not active')
  }

  const task: Task = {
    id: nextTaskId++,
    issue_id: issue.id,
    issue_title: issue.title,
    issue_reference: issue.reference_number,
    district: issue.district,
    assigned_to: worker.id,
    assigned_to_name: worker.name,
    title: `Task for ${issue.reference_number}`,
    admin_notes: payload.admin_notes ?? null,
    status: 'todo',
    due_date: payload.due_date ?? null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }

  getDemoTasks().unshift(task)
  worker.active_task_count = (worker.active_task_count ?? 0) + 1

  const steps = (payload.steps ?? []).map((title, index) => ({
    id: nextTaskStepId++,
    title,
    description: null,
    order: index + 1,
    is_completed: false,
    completed_at: null
  }))
  getDemoTaskStepsStore()[task.id] = steps

  updateDemoIssue(issue.id, { status: 'assigned' })
  appendDemoActivity(issue.id, `Task assigned to ${worker.name}`, 1, {
    task_id: task.id,
    worker_id: worker.id,
    steps: payload.steps ?? []
  })

  return task
}

export function getDemoAnalytics(): AnalyticsOverview {
  const issues = getDemoIssues()
  const open = issues.filter((i) => !['resolved', 'closed', 'rejected'].includes(i.status))
  const resolvedThisMonth = issues.filter(
    (i) => i.status === 'resolved' && i.resolved_at?.startsWith('2026-07')
  )

  const districtMap = new Map<string, number>()
  const categoryMap = new Map<string, number>()
  for (const issue of issues) {
    districtMap.set(issue.district, (districtMap.get(issue.district) ?? 0) + 1)
    if (issue.ai_category) {
      categoryMap.set(issue.ai_category, (categoryMap.get(issue.ai_category) ?? 0) + 1)
    }
  }

  return {
    total_open_issues: open.length,
    resolved_this_month: resolvedThisMonth.length,
    avg_resolution_days: 6.5,
    active_workers: getDemoWorkers().filter((w) => w.status === 'active').length,
    issues_by_district: [...districtMap.entries()].map(([district, count]) => ({ district, count })),
    issues_by_category: [...categoryMap.entries()].map(([category, count]) => ({ category, count }))
  }
}

export const DEFAULT_DISTRICTS = [
  'Gasabo',
  'Kicukiro',
  'Nyarugenge',
  'Burera',
  'Gakenke',
  'Gicumbi',
  'Musanze',
  'Rulindo',
  'Gisagara',
  'Huye',
  'Kamonyi',
  'Muhanga',
  'Nyamagabe',
  'Nyanza',
  'Nyaruguru',
  'Ruhango',
  'Bugesera',
  'Gatsibo',
  'Kayonza',
  'Kirehe',
  'Ngoma',
  'Nyagatare',
  'Rwamagana',
  'Karongi',
  'Ngororero',
  'Nyabihu',
  'Nyamasheke',
  'Rubavu',
  'Rusizi',
  'Rutsiro'
]

export const DEFAULT_ADMIN_SETTINGS: AdminSettings = {
  priority_weights: { citizen: 0.3, ai: 0.4, community: 0.3 },
  ai_prompt_template: `You are a civic issue triage assistant for Rwanda.

Analyze the citizen report and respond with JSON:
- category (roads|water|electricity|sanitation|health|education|security|environment|other)
- tags (array of strings)
- summary (1-2 sentences, public-safe)
- priority (1-5 integer)
- confidence (0-1 float)

Issue title: {title}
Description: {description}
District: {district}`,
  notification_templates: {
    issue_status_changed:
      'Your report {reference} status is now {status}. Track progress in the CIR app.',
    task_assigned: 'New task assigned: {title} in {district}. Due date in worker app.',
    issue_resolved:
      'Good news! Your report {reference} has been resolved. Thank you for helping improve your community.'
  },
  districts: [...DEFAULT_DISTRICTS]
}

const DEMO_FLAGGED_COMMENTS: FlaggedComment[] = [
  {
    id: 101,
    issue_id: 1,
    issue_reference: 'CIR-2026-00001',
    issue_title: 'Large pothole on KG 11 Ave near market',
    user_id: 10,
    author_name: 'Jean Paul',
    body: 'Officials never fix anything here. They only care about photo ops.',
    flagged_count: 4,
    is_visible: true,
    comment_banned: false,
    created_at: '2026-07-03T09:15:00Z'
  },
  {
    id: 102,
    issue_id: 2,
    issue_reference: 'CIR-2026-00002',
    issue_title: 'Broken water pipe flooding street in Kicukiro',
    user_id: 11,
    author_name: 'Anonymous Citizen',
    body: 'Spam link: http://fake-deals.example — click for free water tanks!!!',
    flagged_count: 6,
    is_visible: false,
    comment_banned: false,
    created_at: '2026-07-02T18:40:00Z'
  },
  {
    id: 103,
    issue_id: 3,
    issue_reference: 'CIR-2026-00003',
    issue_title: 'Uncollected garbage near Nyabugogo bus station',
    user_id: 12,
    author_name: 'Alice Mukamana',
    body: 'This area smells terrible and nobody is doing anything about it.',
    flagged_count: 3,
    is_visible: true,
    comment_banned: false,
    created_at: '2026-06-29T14:00:00Z'
  }
]

let mockFlaggedStore: FlaggedComment[] | null = null
let mockSettingsStore: AdminSettings | null = null
const bannedCommentUserIds = new Set<number>()

export function getDemoFlaggedComments(): FlaggedComment[] {
  if (!mockFlaggedStore) {
    mockFlaggedStore = DEMO_FLAGGED_COMMENTS.map((item) => ({ ...item }))
  }
  return mockFlaggedStore
}

export function approveDemoFlaggedComment(id: number): void {
  const store = getDemoFlaggedComments()
  const index = store.findIndex((item) => item.id === id)
  if (index === -1) throw new Error('Comment not found')
  store.splice(index, 1)
}

export function deleteDemoFlaggedComment(id: number): void {
  approveDemoFlaggedComment(id)
}

export function banDemoCommentAuthor(userId: number): void {
  bannedCommentUserIds.add(userId)
  const store = getDemoFlaggedComments()
  for (const comment of store) {
    if (comment.user_id === userId) {
      comment.comment_banned = true
    }
  }
}

export function getDemoSettings(): AdminSettings {
  if (!mockSettingsStore) {
    mockSettingsStore = structuredClone(DEFAULT_ADMIN_SETTINGS)
  }
  return mockSettingsStore
}

export function updateDemoSettings(payload: UpdateAdminSettingsPayload): AdminSettings {
  const current = getDemoSettings()
  if (payload.priority_weights) {
    current.priority_weights = { ...payload.priority_weights }
  }
  if (payload.ai_prompt_template !== undefined) {
    current.ai_prompt_template = payload.ai_prompt_template
  }
  if (payload.notification_templates) {
    current.notification_templates = { ...payload.notification_templates }
  }
  if (payload.districts) {
    current.districts = [...payload.districts]
  }
  return structuredClone(current)
}

const INITIAL_TASK_STEPS: Record<number, TaskStep[]> = {
  101: [
    { id: 1, title: 'Inspect site', description: null, order: 1, is_completed: true, completed_at: '2026-07-04T08:00:00Z' },
    { id: 2, title: 'Coordinate cleanup crew', description: null, order: 2, is_completed: true, completed_at: '2026-07-04T10:00:00Z' },
    { id: 3, title: 'Submit report', description: null, order: 3, is_completed: false, completed_at: null }
  ],
  102: [
    { id: 4, title: 'Inspect transformer box', description: null, order: 1, is_completed: false, completed_at: null },
    { id: 5, title: 'Replace bulbs', description: null, order: 2, is_completed: false, completed_at: null }
  ]
}

const INITIAL_TASK_COMMENTS: Record<number, TaskComment[]> = {
  101: [
    {
      id: 1,
      user_id: 2,
      author_name: 'Emmanuel Niyonsaba',
      body: 'Team on site. Garbage pile is larger than expected.',
      type: 'comment',
      created_at: '2026-07-04T09:00:00Z'
    }
  ],
  102: [
    {
      id: 2,
      user_id: 3,
      author_name: 'Grace Uwimana',
      body: 'Need access key for junction box — please confirm with district.',
      type: 'clarification_request',
      created_at: '2026-07-04T11:00:00Z'
    }
  ]
}

function getDemoTaskStepsStore(): Record<number, TaskStep[]> {
  if (!mockTaskStepsStore) {
    mockTaskStepsStore = Object.fromEntries(
      Object.entries(INITIAL_TASK_STEPS).map(([k, v]) => [Number(k), v.map((s) => ({ ...s }))])
    )
  }
  return mockTaskStepsStore
}

function getDemoTaskCommentsStore(): Record<number, TaskComment[]> {
  if (!mockTaskCommentsStore) {
    mockTaskCommentsStore = Object.fromEntries(
      Object.entries(INITIAL_TASK_COMMENTS).map(([k, v]) => [Number(k), v.map((c) => ({ ...c }))])
    )
  }
  return mockTaskCommentsStore
}

export function getDemoTask(id: number): TaskDetail {
  const task = getDemoTasks().find((item) => item.id === id)
  if (!task) throw new Error('Task not found')
  return {
    ...task,
    steps: getDemoTaskStepsStore()[id] ?? [],
    comments: getDemoTaskCommentsStore()[id] ?? []
  }
}

export function updateDemoTask(id: number, payload: UpdateTaskPayload): TaskDetail {
  const tasks = getDemoTasks()
  const index = tasks.findIndex((item) => item.id === id)
  if (index === -1) throw new Error('Task not found')

  const current = tasks[index]
  let assignedToName = current.assigned_to_name

  if (payload.assigned_to && payload.assigned_to !== current.assigned_to) {
    const oldWorker = getDemoWorkers().find((w) => w.id === current.assigned_to)
    const newWorker = getDemoWorkers().find((w) => w.id === payload.assigned_to)
    if (!newWorker || newWorker.status !== 'active') throw new Error('Worker not found or not active')
    if (oldWorker) oldWorker.active_task_count = Math.max(0, (oldWorker.active_task_count ?? 0) - 1)
    newWorker.active_task_count = (newWorker.active_task_count ?? 0) + 1
    assignedToName = newWorker.name
    appendDemoActivity(current.issue_id, `Task reassigned to ${newWorker.name}`, 1, {
      task_id: id,
      from_worker_id: current.assigned_to,
      to_worker_id: payload.assigned_to
    })
  }

  if (payload.status && payload.status !== current.status) {
    appendDemoActivity(current.issue_id, `Task status changed to ${payload.status}`, 1, {
      task_id: id,
      from: current.status,
      to: payload.status
    })
  }

  tasks[index] = {
    ...current,
    status: payload.status ?? current.status,
    assigned_to: payload.assigned_to ?? current.assigned_to,
    assigned_to_name: assignedToName,
    due_date: payload.due_date !== undefined ? payload.due_date : current.due_date,
    admin_notes: payload.admin_notes !== undefined ? payload.admin_notes : current.admin_notes,
    updated_at: new Date().toISOString()
  }

  return getDemoTask(id)
}

export function deleteDemoTask(id: number): void {
  const tasks = getDemoTasks()
  const index = tasks.findIndex((item) => item.id === id)
  if (index === -1) throw new Error('Task not found')
  const task = tasks[index]
  const worker = getDemoWorkers().find((w) => w.id === task.assigned_to)
  if (worker) worker.active_task_count = Math.max(0, (worker.active_task_count ?? 0) - 1)
  tasks.splice(index, 1)
  delete getDemoTaskStepsStore()[id]
  delete getDemoTaskCommentsStore()[id]
  appendDemoActivity(task.issue_id, `Task #${id} deleted`, 1, { task_id: id })
}

export function approveDemoTask(id: number): TaskDetail {
  const task = updateDemoTask(id, { status: 'done' })
  updateDemoIssue(task.issue_id, { status: 'resolved' })
  appendDemoActivity(task.issue_id, 'Task approved — issue resolved', 1, { task_id: id })
  return getDemoTask(id)
}

export function rejectDemoTask(id: number): TaskDetail {
  return updateDemoTask(id, { status: 'in_progress' })
}

export function createDemoTaskComment(
  taskId: number,
  body: string,
  type: TaskComment['type'] = 'comment'
): TaskComment {
  const task = getDemoTasks().find((item) => item.id === taskId)
  if (!task) throw new Error('Task not found')
  const comment: TaskComment = {
    id: nextTaskCommentId++,
    user_id: 1,
    author_name: 'Jean Mukamana',
    body,
    type,
    created_at: new Date().toISOString()
  }
  const store = getDemoTaskCommentsStore()
  store[taskId] = [...(store[taskId] ?? []), comment]
  return comment
}

export function inviteDemoWorker(name: string, phone: string): Worker {
  const workers = getDemoWorkers()
  if (workers.some((w) => w.phone === phone)) throw new Error('Phone number already registered.')
  const worker: Worker = {
    id: nextWorkerId++,
    name: name.trim(),
    phone: phone.trim(),
    status: 'invited',
    active_task_count: 0
  }
  workers.push(worker)
  return worker
}

export function updateDemoWorker(id: number, status: Worker['status']): Worker {
  const workers = getDemoWorkers()
  const index = workers.findIndex((w) => w.id === id)
  if (index === -1) throw new Error('Worker not found')
  workers[index] = { ...workers[index], status }
  return workers[index]
}

export function bulkUpdateDemoIssues(issueIds: number[], status: IssueStatus): Issue[] {
  return issueIds.map((id) => updateDemoIssue(id, { status }))
}

export function createDemoPublicNote(issueId: number, body: string): void {
  appendDemoActivity(issueId, `Public resolution note: ${body}`, 1, { public_note: body })
}
