# TMDB Rails Lazy Load Loop Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add per-rail TMDB incremental loading (pages 2-3 on demand), local infinite loop behavior, and hide rail scrollbars without adding extra initial API calls.

**Architecture:** Keep the initial page payload unchanged. Add optional `section/page` query handling to TMDB discover routes, then let each client rail request more items only when near the end of its own horizontal scroll. After page limit is reached, loop locally by duplicating rendered items and resetting scroll position seamlessly.

**Tech Stack:** Next.js App Router, React client components, existing TMDB provider helpers, Node test runner.

---

### Task 1: Client rail helpers (TDD)

**Files:**
- Create: `lib/ui/explore-rail.js`
- Create: `tests/explore-rail.test.js`

1. Write failing tests for dedupe merge + loop list helpers.
2. Run targeted test and confirm fail.
3. Implement minimal helper code.
4. Re-run test and confirm pass.

### Task 2: TMDB section-page server support

**Files:**
- Modify: `lib/providers/discover.js`
- Modify: `app/api/discover/movies/route.js`
- Modify: `app/api/discover/series/route.js`

1. Expose reusable movie/series section loaders by section id and page.
2. Add API route mode `?section=<id>&page=<n>` returning a single section payload.
3. Keep current full-page payload behavior and cache.

### Task 3: Per-rail lazy load + loop UI

**Files:**
- Modify: `components/discover/explore-rails-view.js`
- Modify: `app/globals.css`

1. Add per-rail local state and scroll listener for incremental loads on movies/series pages.
2. Stop after page 3 and enable local loop rendering.
3. Hide horizontal scrollbar while preserving scroll functionality.

### Task 4: Verification

**Files:**
- Test: `tests/explore-rail.test.js`

1. Run targeted helper tests.
2. Run `npm run build`.
3. Manually verify rails in `/explorar/peliculas` and `/explorar/series`.
