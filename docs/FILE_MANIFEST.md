# File manifest

Quick reference for **path → purpose → primary consumers**. Update this file whenever you add a non-trivial source file or script so local dashboards stay accurate.

| Path | Purpose | Used by / audience |
|------|---------|-------------------|
| `package.json` (root) | Workspace orchestration, **canonical app version** (`M.m.T`; middle segment bumps after each green `npm run build`), build/test scripts | npm, CI, dashboards |
| `CHANGELOG.md` | Dated version history, repo URL, build and test-iteration records | Humans, release notes |
| `scripts/record-build.mjs` | After `npm run build`, append changelog entry and bump **middle** semver segment | `package.json` `build` script |
| `scripts/record-test-iteration.mjs` | Bump **third** semver segment and log test iteration | `npm run version:test-iteration` |
| `.cursor/rules/versioning-changelog-file-manifest.mdc` | Agent rule: version, changelog, manifest hygiene | Cursor |
| `packages/api/src/app.ts` | HTTP API (Hono): auth, reports, work orders, **GET /me** (+ points) | Mobile app, web-admin |
| `packages/api/src/db/schema.ts` | Drizzle schema: users, reports, **points_ledger**, etc. | API, migrations, seed |
| `packages/api/src/db/seed.ts` | Demo users, sample reports, **points** welcome + seeded submits | `npm run db:seed` |
| `packages/shared/src/index.ts` | Shared Zod schemas/types (**MeResponse**, report DTOs) | API, web-admin, mobile |
| `apps/mobile/lib/api.ts` | Mobile fetch helpers: demo login, **fetchMe**, reports | Expo screens |
| `apps/mobile/app/index.tsx` | Employee home: session, **Spotter points** from `/me` | Expo router |
| `apps/web-admin/src/api.ts` | Admin/reporter API client including **fetchMe** | React pages |
| `apps/web-admin/src/pages/ReporterHome.tsx` | Reporter landing; **spotter points** hero line | Authenticated reporters |
| `apps/web-admin/src/styles.css` | Global + **`.hero-points`** styles | Vite app |

_Add rows above this line for new modules._
