# Call Pat prototype — review guide

This document helps reviewers validate the **employee reporting** and **dispatcher** flows before a wider pilot.

## What shipped

| Surface | Purpose |
|---------|---------|
| **Web (Vite)** | Single app: **employee** reporter (`/reporter/*`) and **dispatcher/admin** console (`/queue`, `/reports/*`). |
| **API (Hono + SQLite)** | REST API, demo JWT auth, multipart photos, status history, work orders. |
| **Mobile (Expo)** | Native-leaning reporter flow (camera, map); same API. |

Design choice: **one web bundle** for both roles (separate routes, role-gated) avoids a second deploy and matches small-team maintenance. Production would split by subdomain or SSO claims only.

## Quick start (reviewer machine)

1. `npm install` (root workspaces)
2. `npm run install:mobile` (Expo app; skip if you only review web + API)
3. `npm run db:push` and `npm run db:seed`
4. `npm run dev` — API `http://localhost:8787`, web `http://localhost:5173`

## Demo accounts

| Email | Role | Where to test |
|-------|------|----------------|
| `reporter@demo.local` | employee | Web `/reporter` or Expo mobile |
| `dispatcher@demo.local` | dispatcher | Web `/queue` |
| `admin@demo.local` | admin | Same as dispatcher |

## Suggested review script (15–20 min)

1. **Employee (web)**  
   Sign in as `reporter@demo.local` → **New report** → attach image, set title/description, adjust lat/lng if needed → submit → open **My reports** → open a report and read the **status timeline**.

2. **Dispatcher**  
   Sign out → sign in as `dispatcher@demo.local` → **Queue** → use **Status** and **Category** filters → open a report → **Create work order** (or link existing) → open work order → advance **status** with an optional note.

3. **Employee again**  
   Sign out → sign in as reporter → open the same report → confirm timeline shows new events after refresh.

4. **API**  
   `GET http://localhost:8787/health` → `{"ok":true}`.

## Out of scope (explicit)

- Real SSO / Azure AD  
- Production hosting, TLS, backups  
- Push notifications  
- Gamification  
- Virus scanning of uploads  

## Security note for demos

`DEMO_JWT_SECRET` defaults to a dev value. **Change it** (and rotate demo users) before any shared or non-local environment.

## Automated checks

CI runs `npm ci`, `db:push`, `db:seed`, `npm run test` (API smoke test), and `npm run build` on pushes and PRs to `main`.
