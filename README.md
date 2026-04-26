# Call Pat (prototype) — CABQ 311 Field

Monorepo for the **Call Pat** internal reporting prototype (branded **CABQ 311 Field** in the apps): **Expo** employee app, **Node** API with **SQLite**, and **Vite** admin UI. Demo auth only (no real SSO).

**GitHub:** [github.com/dpiersol/call-pat-prototype](https://github.com/dpiersol/call-pat-prototype) (private)

**Deployment / identity (city, cloud vs on‑prem, @cabq.gov):** [docs/DEPLOYMENT_AND_IDENTITY.md](docs/DEPLOYMENT_AND_IDENTITY.md)

## CI

- **GitHub Actions** runs `npm ci`, `npm run db:push`, and `npm run build` on every push and pull request to `main` (see `.github/workflows/ci.yml`).

## Prerequisites

- **Node.js 20+** and npm (or pnpm)
- **iOS Simulator / Android emulator / Expo Go** for the mobile app

### Windows: Node on `PATH`

If `node` is not found after installing Node.js, close and reopen the terminal, or add Node’s install directory to your user `PATH` (for example `C:\Program Files\nodejs`).

A **portable** Node zip was used successfully for automation: unpack under `%USERPROFILE%\node-portable\node-v20.x.x-win-x64` and prepend that folder to `PATH` for the session.

## Setup

From the repo root (`call-pat-prototype`):

```bash
npm install
```

This repo uses **npm workspaces** for `packages/*` and `apps/web-admin`. The **Expo mobile app** (`apps/mobile`) is **not** hoisted into the root workspace (npm’s dependency tree breaks on `react-native` when it is a workspace package). Install the mobile app separately after the root install (see **Run the mobile app** below). Shared code is linked via `"@call-pat/shared": "file:../../packages/shared"` in `apps/mobile/package.json`.

Create the database and seed demo users (from repo root). The API package runs a `predb:push` step that creates `packages/api/data` before Drizzle applies the schema:

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

Install mobile dependencies once (after `npm install` at the repo root):

```bash
npm run install:mobile
```

Then start Expo:

```bash
npm run dev:mobile
```

Then open the project in **Expo Go** (same LAN) or an emulator. For iOS TestFlight or App Store builds, see `apps/mobile/docs/BUILD_IOS.md`.

**EAS cloud builds (progress and logs):** after `eas build`, follow the printed link or open [expo.dev](https://expo.dev) → your project → **Builds**. Details: [apps/mobile/docs/MONITORING_EAS.md](apps/mobile/docs/MONITORING_EAS.md).

For a **physical device**, the API must be reachable on your LAN. Copy `apps/mobile/.env.example` to `apps/mobile/.env` and set your machine’s IP:

```bash
EXPO_PUBLIC_API_URL=http://192.168.x.x:8787
```

Restart Expo after changing env.

**Google Play (AAB) builds:** see [apps/mobile/docs/BUILD_ANDROID.md](apps/mobile/docs/BUILD_ANDROID.md).

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

## First preview (local)

1. `npm install` (root workspaces only)
2. `npm run install:mobile` (Expo app; one-time or when mobile deps change)
3. `npm run db:push` then `npm run db:seed`
4. `npm run dev` — open [http://localhost:5173](http://localhost:5173) (admin) and confirm [http://localhost:8787/health](http://localhost:8787/health) returns `{"ok":true}`
5. Log in as `dispatcher@demo.local` and open the report queue.

**Lockfiles:** Root `package-lock.json` covers workspaces; `apps/mobile/package-lock.json` covers the Expo app (run `npm run install:mobile` to sync).

## Troubleshooting

| Issue | What to try |
|-------|-------------|
| `drizzle-kit` / `tsx` not found on Windows | Run commands via `npm run` from the repo root (uses local `node_modules/.bin`). Scripts use `npx` where needed. |
| `Cannot open database … directory does not exist` on `db:push` | Run `npm run db:push` again — `predb:push` creates `packages/api/data`. |
| `npm` and `workspace:*` | Use `npm install` with `"*"` in workspace `package.json` deps (as in this repo), not `workspace:*`. |
| `Invalid Version` / npm crash on `react-native` | Mobile is installed separately (`npm run install:mobile`); do not add `apps/mobile` back to root `workspaces`. |
| `better-sqlite3` build errors | Install Visual Studio Build Tools (C++ workload) or use a Node version with prebuilt binaries for your OS. |

## pnpm

If you use pnpm:

```bash
pnpm install
pnpm db:push
pnpm db:seed
pnpm dev
```

Adjust commands using `pnpm --filter @call-pat/<pkg>` as needed. Workspace packages can use `"@call-pat/shared": "workspace:*"` where applicable. For the mobile app, run `cd apps/mobile && pnpm install` (or keep using `npm run install:mobile`).
