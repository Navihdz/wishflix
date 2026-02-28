# Exploration UX Redesign Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Rediseñar la app para separar claramente `Explorar` (Inicio + subpáginas por tipo con carruseles) y `Wishlist` (sidebar por tipo), agregando categorías por género/plataforma para películas/series y secciones visibles para libros/cómics.

**Architecture:** Se agregan endpoints de discover por tipo (`movies/series/books/comics`) y se extienden los proveedores TMDB/OpenLibrary para construir filas (`sections`) homogéneas. La UI reutiliza un componente genérico de carruseles para `Inicio` (hub) y subpáginas de exploración, mientras el sidebar pasa a ser colapsable y separa navegación de explorar vs wishlist.

**Tech Stack:** Next.js App Router, React client components, API routes, TMDB/Open Library, caché en memoria local (`lib/cache.js`), Node test runner (`node --test`).

---

### Task 1: Add discover section builders (pure functions) for consistent payload shape

**Files:**
- Create: `lib/providers/explore-sections.js`
- Test: `tests/explore-sections.test.js`

**Step 1: Write the failing test**

```js
import test from "node:test";
import assert from "node:assert/strict";
import { compactSections, buildExplorePayload } from "../lib/providers/explore-sections.js";

test("compactSections removes empty rails", () => {
  const sections = compactSections([
    { id: "a", title: "A", items: [{ title: "x" }] },
    { id: "b", title: "B", items: [] }
  ]);
  assert.equal(sections.length, 1);
  assert.equal(sections[0].id, "a");
});

test("buildExplorePayload returns hero and sections", () => {
  const payload = buildExplorePayload({
    hero: { title: "Hero" },
    sections: [{ id: "x", title: "X", items: [{ title: "1" }] }]
  });
  assert.equal(payload.hero.title, "Hero");
  assert.equal(Array.isArray(payload.sections), true);
});
```

**Step 2: Run test to verify it fails**

Run: `node --test tests/explore-sections.test.js`
Expected: FAIL (`Cannot find module` / missing exports)

**Step 3: Write minimal implementation**

Create helpers that:
- `compactSections(sections)` removes invalid/empty sections
- `buildExplorePayload({ hero, sections })` returns stable object shape

**Step 4: Run test to verify it passes**

Run: `node --test tests/explore-sections.test.js`
Expected: PASS

**Step 5: Commit**

```bash
git add tests/explore-sections.test.js lib/providers/explore-sections.js
git commit -m "feat: add explore payload section helpers"
```

### Task 2: Extend TMDB provider for genres and platform/provider rails

**Files:**
- Modify: `lib/providers/tmdb.js`
- Create: `tests/tmdb-provider.test.js`

**Step 1: Write the failing test**

Cover pure URL/path building and normalization-friendly helpers (avoid live network):

```js
import test from "node:test";
import assert from "node:assert/strict";
import { buildTmdbPath, TMDB_PROVIDER_IDS } from "../lib/providers/tmdb.js";

test("buildTmdbPath appends query params correctly", () => {
  const path = buildTmdbPath("/discover/movie", { with_genres: "18", page: 1 });
  assert.match(path, /with_genres=18/);
  assert.match(path, /page=1/);
});

test("provider ids include Netflix", () => {
  assert.ok(TMDB_PROVIDER_IDS.NETFLIX);
});
```

**Step 2: Run test to verify it fails**

Run: `node --test tests/tmdb-provider.test.js`
Expected: FAIL (missing exports/helpers)

**Step 3: Write minimal implementation**

In `lib/providers/tmdb.js`:
- Add provider ID map (Netflix, Disney+, Prime Video, Max, Apple TV+)
- Add helper(s) for discover paths:
  - genre-based
  - provider-based (`watch_region=US`, `with_watch_providers=...`)
- Keep `fetchTmdb` + `normalizeTmdb` intact/compatible

**Step 4: Run test to verify it passes**

Run: `node --test tests/tmdb-provider.test.js`
Expected: PASS

**Step 5: Commit**

```bash
git add tests/tmdb-provider.test.js lib/providers/tmdb.js
git commit -m "feat: extend tmdb provider helpers for genres and platforms"
```

### Task 3: Extend Open Library provider for books/comics subjects rails

**Files:**
- Modify: `lib/providers/openlibrary.js`
- Create: `tests/openlibrary-provider.test.js`

**Step 1: Write the failing test**

Test only pure helpers and subject configuration:

```js
import test from "node:test";
import assert from "node:assert/strict";
import { OPENLIBRARY_BOOK_SUBJECTS, OPENLIBRARY_COMIC_SUBJECTS } from "../lib/providers/openlibrary.js";

test("book subjects include fantasy", () => {
  assert.ok(OPENLIBRARY_BOOK_SUBJECTS.find((s) => s.id === "fantasy"));
});

test("comic subjects include manga", () => {
  assert.ok(OPENLIBRARY_COMIC_SUBJECTS.find((s) => s.id === "manga"));
});
```

**Step 2: Run test to verify it fails**

Run: `node --test tests/openlibrary-provider.test.js`
Expected: FAIL (missing exports)

**Step 3: Write minimal implementation**

In `lib/providers/openlibrary.js`:
- Add subject config arrays for books/comics
- Add generic `discoverOpenLibrarySubject(subject, type, limit?)`
- Add wrappers that return sections/rails inputs for books/comics pages
- Preserve current `discoverBooks()` and `discoverComics()` compatibility (or refactor them to call the new helper)

**Step 4: Run test to verify it passes**

Run: `node --test tests/openlibrary-provider.test.js`
Expected: PASS

**Step 5: Commit**

```bash
git add tests/openlibrary-provider.test.js lib/providers/openlibrary.js
git commit -m "feat: add open library subject configs for book and comic rails"
```

### Task 4: Build discover payloads for home and per-type exploration

**Files:**
- Modify: `lib/providers/discover.js`
- Test: `tests/discover-provider.test.js`

**Step 1: Write the failing test**

Use module-level pure builders where possible (no live fetches); test section shaping and empty-rail compaction:

```js
import test from "node:test";
import assert from "node:assert/strict";
import { buildHomePreviewPayload } from "../lib/providers/discover.js";

test("home payload returns sections array", () => {
  const payload = buildHomePreviewPayload({
    mixedTrending: [{ title: "A" }],
    mixedRecent: [{ title: "B" }],
    mixedTop: [{ title: "C" }]
  });
  assert.equal(Array.isArray(payload.sections), true);
  assert.ok(payload.sections.length >= 1);
});
```

**Step 2: Run test to verify it fails**

Run: `node --test tests/discover-provider.test.js`
Expected: FAIL (missing export)

**Step 3: Write minimal implementation**

Refactor `lib/providers/discover.js` to export:
- `discoverHome()` (hub payload with hero + preview sections)
- `discoverMoviesPage()`
- `discoverSeriesPage()`
- `discoverBooksPage()`
- `discoverComicsPage()`
- optional pure builders for testability (`buildHomePreviewPayload`, etc.)

Requirements:
- Movies/series include genre + platform rows.
- Books/comics include subject rows.
- Partial failures degrade by returning empty rows then compacting.

**Step 4: Run test to verify it passes**

Run: `node --test tests/discover-provider.test.js`
Expected: PASS

**Step 5: Commit**

```bash
git add tests/discover-provider.test.js lib/providers/discover.js
git commit -m "feat: build discover payloads for home and explore pages"
```

### Task 5: Add API routes for per-type exploration endpoints with cache keys

**Files:**
- Modify: `app/api/discover/route.js`
- Create: `app/api/discover/movies/route.js`
- Create: `app/api/discover/series/route.js`
- Create: `app/api/discover/books/route.js`
- Create: `app/api/discover/comics/route.js`
- Modify: `lib/cache.js` (only if helper improvements are needed)

**Step 1: Write the failing test**

If route-unit testing is too heavy for current setup, write a small pure-key test instead (recommended MVP):

```js
import test from "node:test";
import assert from "node:assert/strict";
import { readCache, writeCache } from "../lib/cache.js";

test("cache stores separate discover payloads by key", () => {
  writeCache("discover-movies", { ok: 1 }, 1000);
  writeCache("discover-series", { ok: 2 }, 1000);
  assert.equal(readCache("discover-movies").ok, 1);
  assert.equal(readCache("discover-series").ok, 2);
});
```

**Step 2: Run test to verify it fails (if new test)**

Run: `node --test tests/cache-discover-keys.test.js`
Expected: PASS or FAIL depending on chosen test. If PASS immediately, keep and move on (test documents behavior).

**Step 3: Write minimal implementation**

Create route handlers mirroring `app/api/discover/route.js`:
- each route uses its own cache key
- calls the corresponding `discover*Page()` function
- returns JSON payload

Update base `GET /api/discover` to return the new home/hub shape.

**Step 4: Verify endpoints manually**

Run app: `npm run dev`
Visit/inspect:
- `/api/discover`
- `/api/discover/movies`
- `/api/discover/series`
- `/api/discover/books`
- `/api/discover/comics`

Expected:
- JSON with `hero` + `sections[]`
- no server crash if one external call fails

**Step 5: Commit**

```bash
git add app/api/discover/route.js app/api/discover/movies/route.js app/api/discover/series/route.js app/api/discover/books/route.js app/api/discover/comics/route.js lib/cache.js tests/cache-discover-keys.test.js
git commit -m "feat: add discover endpoints for dedicated explore pages"
```

### Task 6: Create reusable exploration rails UI component

**Files:**
- Create: `components/discover/explore-rails-view.js`
- Modify: `components/discover/content-detail-modal.js` (only if prop shape alignment is needed)
- Modify: `components/discover/discover-view.js`

**Step 1: Write the failing test**

If no React test setup exists, skip automated UI test and document manual verification. Add a small pure helper test only if introducing a formatter/mapper function.

**Step 2: Implement minimal reusable UI**

Create `ExploreRailsView` that renders:
- optional `hero`
- `sections[]` as horizontal rails
- shared save behavior (`Guardar`, `Ya en wishlist`)
- detail modal reuse
- loading/error/empty states

Refactor existing `discover-view.js` to use the new component for the home hub preview payload.

**Step 3: Manual verification**

Run: `npm run dev`
Check:
- `Inicio` still renders rows
- Save button works
- “Ya en wishlist” state still updates
- Modal detail still opens

**Step 4: Commit**

```bash
git add components/discover/explore-rails-view.js components/discover/discover-view.js components/discover/content-detail-modal.js
git commit -m "refactor: reuse generic exploration rails view"
```

### Task 7: Implement Home hub UI (hero + big type buttons + previews)

**Files:**
- Modify: `components/discover/discover-view.js`
- Modify: `app/globals.css`
- Optionally Create: `components/discover/explore-type-cards.js`

**Step 1: Write the failing test**

No UI test harness currently exists. Use manual acceptance checklist.

**Step 2: Implement UI**

Add to `Inicio`:
- hero visual area
- large CTA cards linking to:
  - `/explorar/peliculas`
  - `/explorar/series`
  - `/explorar/libros`
  - `/explorar/comics`
- preview rails below buttons

Keep mobile-first layout and large touch targets.

**Step 3: Manual verification**

Check:
- large buttons visible on desktop/mobile
- links navigate correctly
- visual hierarchy feels “streaming app”

**Step 4: Commit**

```bash
git add components/discover/discover-view.js app/globals.css components/discover/explore-type-cards.js
git commit -m "feat: redesign home as exploration hub with type cards"
```

### Task 8: Add dedicated exploration pages and routes by type

**Files:**
- Create: `app/(protected)/explorar/peliculas/page.js`
- Create: `app/(protected)/explorar/series/page.js`
- Create: `app/(protected)/explorar/libros/page.js`
- Create: `app/(protected)/explorar/comics/page.js`
- Create: `app/(protected)/explorar/layout.js` (optional, if shared header/layout improves reuse)
- Create or Modify: `components/discover/type-explore-page.js` (optional shared client component)

**Step 1: Write the failing test**

No route/UI test harness; use manual verification. If adding a pure fetch helper, test that helper.

**Step 2: Implement pages**

Each page:
- fetches corresponding `/api/discover/<type>`
- renders `ExploreRailsView`
- sets title/labels appropriately
- preserves save-to-wishlist logic

**Step 3: Manual verification**

Check each route:
- loads multiple rows
- provider sections appear (Netflix/Disney+ etc. for movies/series)
- books/comics rows render and are distinct
- save + duplicate prevention works

**Step 4: Commit**

```bash
git add app/(protected)/explorar components/discover/type-explore-page.js
git commit -m "feat: add dedicated explore pages for movies series books and comics"
```

### Task 9: Redesign sidebar navigation and make it collapsible

**Files:**
- Modify: `components/layout/sidebar.js`
- Modify: `components/layout/app-shell.js` (if layout state coordination is needed)
- Modify: `app/globals.css`

**Step 1: Write the failing test**

No UI harness; use manual verification checklist.

**Step 2: Implement sidebar changes**

Add:
- grouped nav (`Explorar`, `Mi Wishlist`)
- links to new explore routes
- collapse/expand button (client state; persisted later if desired)
- clear active styling for nested routes (prefix matching for `/explorar/*`)

**Step 3: Manual verification**

Check:
- collapse/expand works
- links remain usable when collapsed
- active route styling works for `/explorar/peliculas` etc.
- logout still works

**Step 4: Commit**

```bash
git add components/layout/sidebar.js components/layout/app-shell.js app/globals.css
git commit -m "feat: add collapsible sidebar with explore and wishlist groups"
```

### Task 10: Simplify/update mobile bottom navigation for new information architecture

**Files:**
- Modify: `components/layout/bottom-nav.js`
- Modify: `app/globals.css`

**Step 1: Write the failing test**

No UI harness; manual verification.

**Step 2: Implement minimal bottom nav**

Option MVP:
- `Inicio`
- `Películas` (wishlist shortcut) or `Wishlist`
- `Historial`

Ensure the primary path to detailed exploration remains the type buttons in `Inicio`.

**Step 3: Manual verification**

Check mobile viewport:
- nav is legible
- tap targets are large enough
- no overlap with page content

**Step 4: Commit**

```bash
git add components/layout/bottom-nav.js app/globals.css
git commit -m "refactor: simplify mobile navigation around exploration hub"
```

### Task 11: Add graceful error states and missing-TMDB messaging

**Files:**
- Modify: `components/discover/explore-rails-view.js`
- Modify: `components/discover/discover-view.js`
- Modify: `lib/providers/discover.js` (if adding metadata flags like `tmdbAvailable`)

**Step 1: Write the failing test**

Add pure-state test if introducing a helper:

```js
import test from "node:test";
import assert from "node:assert/strict";
import { shouldShowTmdbConfigHint } from "../lib/providers/discover.js";

test("tmdb hint shows when no tmdb rows available and key missing", () => {
  assert.equal(shouldShowTmdbConfigHint({ tmdbEnabled: false, type: "movies" }), true);
});
```

**Step 2: Run test to verify it fails**

Run: `node --test tests/discover-tmdb-hint.test.js`
Expected: FAIL (missing helper)

**Step 3: Implement minimal code**

Show:
- section-level fallback (skip empty sections)
- page-level message if no sections
- TMDB-specific config hint for movies/series when key missing
- retry button for fetch failures (client-side re-fetch)

**Step 4: Run test + manual verification**

Run: `node --test tests/discover-tmdb-hint.test.js`
Expected: PASS

Manual:
- temporarily blank `TMDB_API_KEY` and restart server
- verify books/comics still load and movies/series show useful hint

**Step 5: Commit**

```bash
git add tests/discover-tmdb-hint.test.js components/discover/explore-rails-view.js components/discover/discover-view.js lib/providers/discover.js
git commit -m "feat: add discover error states and tmdb configuration hints"
```

### Task 12: Final verification and documentation touch-ups

**Files:**
- Modify: `README.md` (document new explore routes/UX and TMDB provider-platform note)
- Optionally Modify: `docs/plans/2026-02-23-exploration-ux-redesign-design.md` (if implementation deviated)

**Step 1: Run automated tests**

Run:
- `npm test`
- `node --test tests/explore-sections.test.js tests/tmdb-provider.test.js tests/openlibrary-provider.test.js tests/discover-provider.test.js`

Expected:
- all pass

**Step 2: Run build verification**

Run: `npm run build`
Expected:
- successful Next.js production build

**Step 3: Manual acceptance checklist**

Verify:
- `Inicio` = hub de exploración con botones grandes
- subpáginas dedicadas por tipo funcionan
- películas/series tienen filas de género + plataformas
- libros/cómics tienen filas propias y cómics visibles
- guardar evita duplicados
- sidebar colapsable funciona
- wishlist por tipo sigue operativa

**Step 4: Commit**

```bash
git add README.md
git commit -m "docs: document redesigned exploration navigation and discover routes"
```

## Notes for Implementation

- Preferir extraer lógica pura para facilitar pruebas en `node:test` sin montar UI.
- Evitar depender de tests de red real; testear configuración, mapeos y shape de payloads.
- Mantener compatibilidad con el shape de ítems ya usado por wishlist (`title`, `poster_image`, `type`, `source`, `external_id`, etc.).
- Si algún proveedor TMDB de plataforma cambia de ID, centralizar la actualización en `TMDB_PROVIDER_IDS`.
- Para activos visuales y estilos, priorizar cambios en `app/globals.css` y componentes existentes antes de agregar nuevas dependencias.

