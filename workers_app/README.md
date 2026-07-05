# CIR Worker Mobile App

React Native (Expo) field-worker app for the Citizen Issue Report platform.

## Quick start

```bash
cd workers_app
npm install
npx expo start
```

> **Note:** `.npmrc` enables `legacy-peer-deps` for React Native 0.86 compatibility. If install fails, run `npm install --legacy-peer-deps`.

Scan the QR code with **Expo Go** on your phone (same Wi‑Fi network).

## Demo flow (~1 minute)

1. **Login** — enter `+250788123456` (any valid +250 + 9 digits)
2. **OTP** — enter any 6-digit code (e.g. `123456`)
3. **Task list** — tap a task (try "Broken water pipe" — already in progress with an update)
4. **Checklist** — toggle a step
5. **Progress update** — post a note (min 10 chars) + optional photo
6. **Status** — tap "→ In Review" (requires at least one update)

For a fresh `todo` task, first tap "→ In Progress", post an update, then move to review.

## Tech stack

- Expo + React Native + TypeScript
- NativeWind (Tailwind CSS)
- React Navigation (stack)
- Axios (API layer — mocked)
- Context API (auth + tasks)
- expo-image-picker (camera/gallery)

## Project structure

```
workers_app/
├── api/
│   ├── client.ts      ← single swap point (USE_MOCK flag)
│   └── mockData.ts    ← realistic demo data
├── components/
├── context/
├── navigation/
├── screens/
├── types/
└── utils/
```

## Switching to real Laravel API

1. Backend team implements endpoints in [BACKEND_REQUIREMENTS.md](./BACKEND_REQUIREMENTS.md)
2. Set `USE_MOCK = false` in `api/client.ts`
3. Set environment variable:
   ```bash
   EXPO_PUBLIC_API_URL=http://YOUR_LAN_IP:8000/api
   ```

## Features

### Must-have (built)
- Phone OTP login (mocked)
- Task list with status badges
- Task detail: photos, checklist, progress updates, status changes
- Status transition rules enforced in UI
- Review requires progress update

### Nice-to-have (built)
- Internal comments + "Request clarification"
- Open in Google Maps link
- Kanban board view (tap "Board" on task list)

### Explicitly not built
- Push notifications, offline sync, analytics, time tracking

## Status colors

| Status | Color |
|--------|-------|
| todo | gray |
| in_progress | blue |
| blocked | red |
| review | purple |
| done | green |
