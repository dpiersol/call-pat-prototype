# Call Pat (prototype)

Monorepo for the **Call Pat** internal reporting prototype: **Expo** employee app, **Node** API with **SQLite**, and **Vite** admin UI. Demo auth only (no real SSO).

**GitHub:** [github.com/dpiersol/call-pat-prototype](https://github.com/dpiersol/call-pat-prototype) (private)

## Prerequisites

- **Node.js 20+** and npm (or pnpm)
- **iOS Simulator / Android emulator / Expo Go** for the mobile app

## Setup

From the repo root (`call-pat-prototype`):

```bash
npm install
```

Create the database and seed demo users (from repo root):

```bash
npm run db:push
npm run db:seed
```

Optional environment variables for the API (defaults work for local dev):

| Variable | Default | Purpose |
|----------|---------|---------|
| `PORT` | `8787` | HTTP port |
| `DATABASE_URL` | `file:./data/callpat.db` (relative to `packages/api` when run from that package) | SQLite file |
| `UPLOAD_DIR` | `./uploads` (relative to API cwd) | Photo storage |
| `DEMO_JWT_SECRET` | dev default | JWT signing (change for anything beyond local demos) |

## Run the API and web admin

```bash
npm run dev
```

- API: [http://localhost:8787/health](http://localhost:8787/health)
- Admin UI: [http://localhost:5173](http://localhost:5173) (log in as a dispatcher or admin below)

Copy `apps/web-admin/.env.example` to `apps/web-admin/.env` if you need a non-default API URL:

```bash
VITE_API_URL=http://localhost:8787
```

## Run the mobile app

```bash
npm run dev:mobile
```

Then open the project in **Expo Go** (same LAN) or an emulator.

For a **physical device**, the API must be reachable on your LAN. Copy `apps/mobile/.env.example` to `apps/mobile/.env` and set your machine’s IP:

```bash
EXPO_PUBLIC_API_URL=http://192.168.x.x:8787
```

Restart Expo after changing env.

## Demo accounts

| Email | Role | Use |
|-------|------|-----|
| `reporter@demo.local` | employee | Mobile app sign-in |
| `dispatcher@demo.local` | dispatcher | Web admin queue |
| `admin@demo.local` | admin | Web admin queue |

Passwordless: each app calls `POST /auth/demo-login` with `{ "email": "..." }` and receives a JWT.

## What to try

1. **Mobile:** Sign in as **reporter** → **New report** → photo → adjust map pin → details → submit → **My reports** → open a report and view the **status timeline**.
2. **Admin:** Sign in as **dispatcher** → **Report queue** → open a report → **Create work order** (or link an existing one) → open the work order and advance **status**; refresh the mobile report to see synced timeline events.

## Workspace layout

- `packages/shared` — Zod schemas and shared types (`@call-pat/shared`)
- `packages/api` — Hono REST API (`@call-pat/api`)
- `apps/mobile` — Expo Router app (`@call-pat/mobile`)
- `apps/web-admin` — Vite + React admin (`@call-pat/web-admin`)

## pnpm

If you use pnpm:

```bash
pnpm install
pnpm db:push
pnpm db:seed
pnpm dev
```

Adjust commands using `pnpm --filter @call-pat/<pkg>` as needed.
