# CIR Admin App (Electron + React)

Frontend-only **Electron + React** admin desktop app for the Citizen Issue Report platform.

## Stack

- Electron + Vite + React + TypeScript
- React Router + TanStack Query + axios
- Tailwind CSS

## Run

```bash
cd Apps/admin_app
cp .env.example .env
npm install
npm run dev
```

> **Note:** Clear `NODE_OPTIONS` before starting Electron if you used `--use-system-ca` for npm install:
> `Remove-Item Env:NODE_OPTIONS -ErrorAction SilentlyContinue`

## Env

`VITE_API_BASE_URL=http://localhost:8000/api/v1`

## Screens

- Login (email/password or +250 OTP)
- Issue Inbox
- Issue Detail (AI panel, priority override, status change)
- Placeholders: Tasks, Workers, Analytics, Settings

## Branch

`admin_app`
