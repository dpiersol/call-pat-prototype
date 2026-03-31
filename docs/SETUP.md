# Environment setup log (Call Pat prototype)

This document records how the dev environment was brought up and issues that were fixed.

## Tooling

- **Node.js 20.x** — Portable Windows x64 zip installed under `%USERPROFILE%\node-portable\node-v20.18.3-win-x64` and prepended to `PATH` for sessions where `node` was not globally available.
- **winget** `OpenJS.NodeJS.LTS` was attempted; the MSI installer may prompt for elevation (UAC). Portable Node avoids that.
- **Git** and **GitHub CLI** (`gh`) were already present for the remote repository.

## npm workspaces (npm vs pnpm)

- `npm install` failed with `Unsupported URL Type "workspace:"` when dependencies used `"workspace:*"`.
- Internal packages were changed to `"@call-pat/shared": "*"` so npm workspaces resolve correctly.
- `pnpm` users can use `workspace:*` if they switch the repo to pnpm exclusively.

## Windows script execution

- `drizzle-kit` and `tsx` were not resolved when invoked as bare commands from some contexts.
- `packages/api` scripts were updated to use `npx drizzle-kit` and `npx tsx` so the local `node_modules` binaries are used.

## Database directory

- `drizzle-kit push` failed with `Cannot open database because the directory does not exist` because `file:./data/callpat.db` requires `packages/api/data` to exist.
- Added `predb:push` in `packages/api/package.json` to run `node -e "require('node:fs').mkdirSync('data',{recursive:true})"` before `drizzle-kit push`.

## Web admin build

- TypeScript failed on `import.meta.env` until `apps/web-admin/src/vite-env.d.ts` was added with `/// <reference types="vite/client" />`.

## Verification performed

- `npm install` (clean) — ~1000 packages, `package-lock.json` generated.
- `npm run db:push` — schema applied to SQLite.
- `npm run db:seed` — demo users inserted.
- `npm run build -w @call-pat/web-admin` — production build succeeded.
- API `GET /health` returned `{"ok":true}` with the dev server running.

## API TypeScript (`tsc`)

- `packages/api` uses Hono route groups with `c.get("user")`. The `authed` and `staff` `Hono` instances are typed with `{ Variables: { user: AuthUser } }` so `tsc` passes under strict mode.

## CI

- GitHub Actions workflow `.github/workflows/ci.yml` runs `npm ci`, `npm run db:push`, and `npm run build` on pushes and PRs to `main`.

## Known follow-ups

- `npm audit` reports vulnerabilities in transitive dependencies; address in a dedicated pass if required for deployment.
- Expo mobile app was not started in this session; run `npm run dev:mobile` after `npm install`.
