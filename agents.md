# Agent and collaborator conventions

This file applies whether you work **solo**, on a **team**, or with **multiple AI agents** on one repository. It is the durable counterpart to chat: **the repo wins when something disagrees with a conversation.**

## About this repository

- **Call Pat (prototype)** — npm **monorepo**: `packages/shared` (Zod/types), `packages/api` (**Hono** + **SQLite** via Drizzle), `apps/web-admin` (**Vite** admin), `apps/mobile` (**Expo** — **not** hoisted in root workspaces; install via `npm run install:mobile`). See [`README.md`](README.md).
- **Auth:** Demo JWT only (`POST /auth/demo-login`) — **not** production SSO; see [`docs/DEPLOYMENT_AND_IDENTITY.md`](docs/DEPLOYMENT_AND_IDENTITY.md) for deployment/identity notes.
- **CI:** GitHub Actions runs `npm ci`, `npm run db:push`, and `npm run build` on pushes/PRs to `main` (`.github/workflows/ci.yml`).
- **DB:** After clone, run `npm run db:push` and `npm run db:seed` from repo root; API uses SQLite under `packages/api/data` by default.
- **Windows:** Prefer **`npm run`** from repo root so local `node_modules/.bin` resolves (`drizzle-kit`, `tsx`, etc.).

## Read order

1. This file (`agents.md`)
2. `current_task.md`
3. [`README.md`](README.md) and troubleshooting table

## Source of truth

- **Git history and committed files** are authoritative—not chat transcripts.
- **Lockfiles:** Root `package-lock.json` for workspaces; `apps/mobile/package-lock.json` for Expo—keep installs in sync per README.

## Branches and integration

- Prefer **one logical task per branch**; **pull latest** before large changes; keep **`main`** green for CI.

## `current_task.md`

- List which **package** (`api`, `web-admin`, `mobile`, `shared`) you are touching to reduce parallel-edit conflicts.

## Solo dev

- Use `current_task.md` when switching between **API**, **admin**, and **mobile** work.

## Team

- Coordinate API contract changes (`packages/shared` + API routes) with consumers (web-admin, mobile).

## Multiple agents (or agent + human) on one repo

- **Split by package/app** when possible; avoid concurrent edits to **`packages/shared`** schemas without a single owner.
- **Database migrations / seed** — coordinate so two sessions do not fight `drizzle` state.

## Optional local overrides

- Use a **gitignored** `current_task.local.md` for private notes.
