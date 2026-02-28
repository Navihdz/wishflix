# Team Onboarding and Wishlist Merge Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add registration, optional team onboarding, team join codes, active team switching, and wishlist merge with dedup + multi-contributor support.

**Architecture:** Extend Prisma schema with active team + join code + contributor pivot, add team APIs and merge service, then wire login/onboarding/settings UI to new endpoints while preserving existing session behavior. Merging stays server-side and transactional.

**Tech Stack:** Next.js App Router, Prisma + SQLite, Node test runner.

---

### Task 1: Schema + migration-safe service surface

**Files:**
- Modify: `prisma/schema.prisma`
- Modify: `lib/auth/current-user.js`
- Create: `lib/spaces/join-code.js`
- Create: `lib/spaces/merge.js`
- Test: `tests/team-merge.test.js`

1. Write failing tests for merge/dedup/status/contributors.
2. Run the tests and confirm red.
3. Implement minimal merge helpers and join code helper.
4. Update current-user context to use active space fallback safely.
5. Re-run tests and confirm green.

### Task 2: Auth + spaces APIs

**Files:**
- Create: `app/api/auth/register/route.js`
- Create: `app/api/auth/session/route.js`
- Create: `app/api/spaces/me/route.js`
- Create: `app/api/spaces/create/route.js`
- Create: `app/api/spaces/join/route.js`
- Create: `app/api/spaces/switch-active/route.js`
- Modify: `app/api/items/route.js`

1. Write failing integration-light tests for request validation and merge behavior entry points.
2. Run the tests and confirm red.
3. Implement APIs with auth checks and minimal error handling.
4. Ensure item creation also writes `ItemContributor`.
5. Re-run tests and confirm green.

### Task 3: Login/register/onboarding/settings UI

**Files:**
- Modify: `app/login/page.js`
- Modify: `components/layout/sidebar.js`
- Modify: `components/wishlist/wishlist-row.js`
- Modify: `app/globals.css`
- Create: `app/onboarding/page.js`
- Create: `app/(protected)/ajustes/page.js`

1. Add failing UI behavior tests where practical (pure helpers); manual verify for client routes.
2. Implement register toggle and post-auth redirect logic.
3. Implement onboarding options and settings actions.
4. Update wishlist row to show multiple contributors.
5. Run test suite and manual navigation checks.

### Task 4: Data backfill + seed + Docker

**Files:**
- Modify: `prisma/seed.mjs`
- Create: `prisma/migrations/*` (generated)
- Create: `Dockerfile`
- Create: `docker-compose.yml`
- Create: `.dockerignore`
- Modify: `README.md`

1. Generate and apply Prisma migration.
2. Backfill existing users/items and update seed.
3. Add Docker assets for persistent deployment.
4. Run build/tests and verify container startup path.

