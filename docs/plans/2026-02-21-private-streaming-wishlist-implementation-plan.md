# Private Streaming Wishlist Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Construir un MVP web app en español, mobile-first, con wishlist compartida por 2 usuarios, discovery de contenido y gestión por tipo/estado.

**Architecture:** Aplicación monolítica con Next.js App Router que sirve frontend y API internas. Persistencia local en SQLite con Prisma y autenticación por email/password con sesión por cookie. Integraciones externas con TMDB y Open Library mediante adaptadores server-side con cache.

**Tech Stack:** Next.js 15+, TypeScript, Prisma, SQLite, Zod, bcrypt, jose/cookies, Tailwind CSS, React Query (opcional para caché cliente), Vitest, Playwright.

---

### Task 1: Scaffold base del proyecto

**Files:**
- Create: `package.json`
- Create: `next.config.ts`
- Create: `tsconfig.json`
- Create: `app/layout.tsx`
- Create: `app/page.tsx`
- Create: `app/globals.css`
- Create: `public/manifest.webmanifest`

**Step 1: Write the failing test**

```ts
// tests/smoke/app-smoke.test.ts
import { existsSync } from "node:fs";
import { describe, it, expect } from "vitest";

describe("project scaffold", () => {
  it("has app entrypoints", () => {
    expect(existsSync("app/layout.tsx")).toBe(true);
    expect(existsSync("app/page.tsx")).toBe(true);
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm run test -- tests/smoke/app-smoke.test.ts`
Expected: FAIL because files do not exist.

**Step 3: Write minimal implementation**

Crear estructura base Next + estilos globales + manifest PWA mínimo.

**Step 4: Run test to verify it passes**

Run: `npm run test -- tests/smoke/app-smoke.test.ts`
Expected: PASS.

**Step 5: Commit**

```bash
git add package.json next.config.ts tsconfig.json app/layout.tsx app/page.tsx app/globals.css public/manifest.webmanifest tests/smoke/app-smoke.test.ts
git commit -m "chore: scaffold next app with pwa manifest"
```

### Task 2: Configurar Prisma + SQLite + schema inicial

**Files:**
- Create: `prisma/schema.prisma`
- Create: `prisma/migrations/*`
- Create: `.env.example`
- Create: `lib/db.ts`
- Test: `tests/db/schema.test.ts`

**Step 1: Write the failing test**

```ts
// tests/db/schema.test.ts
import { describe, it, expect } from "vitest";
import { PrismaClient } from "@prisma/client";

describe("schema", () => {
  it("creates core tables", async () => {
    const prisma = new PrismaClient();
    const users = await prisma.user.count();
    expect(users).toBeGreaterThanOrEqual(0);
    await prisma.$disconnect();
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm run test -- tests/db/schema.test.ts`
Expected: FAIL because Prisma client/schema is missing.

**Step 3: Write minimal implementation**

Modelos: `User`, `Space`, `SpaceMember`, `Item` con índice único en `(spaceId,type,source,externalId)`.

**Step 4: Run test to verify it passes**

Run: `npx prisma migrate dev --name init && npm run test -- tests/db/schema.test.ts`
Expected: migración OK, test PASS.

**Step 5: Commit**

```bash
git add prisma/schema.prisma prisma/migrations .env.example lib/db.ts tests/db/schema.test.ts
git commit -m "feat: add sqlite prisma schema for shared wishlist"
```

### Task 3: Seed local con 2 usuarios y 1 space compartido

**Files:**
- Create: `prisma/seed.ts`
- Modify: `package.json`
- Test: `tests/db/seed.test.ts`

**Step 1: Write the failing test**

```ts
// tests/db/seed.test.ts
import { PrismaClient } from "@prisma/client";
import { describe, it, expect } from "vitest";

describe("seed", () => {
  it("creates shared space with two members", async () => {
    const prisma = new PrismaClient();
    const spaces = await prisma.space.findMany({ include: { members: true } });
    expect(spaces.some(s => s.members.length >= 2)).toBe(true);
    await prisma.$disconnect();
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm run test -- tests/db/seed.test.ts`
Expected: FAIL before seed.

**Step 3: Write minimal implementation**

Seed de 2 usuarios (`yo`, `esposa`) y 1 `space` común.

**Step 4: Run test to verify it passes**

Run: `npx prisma db seed && npm run test -- tests/db/seed.test.ts`
Expected: PASS.

**Step 5: Commit**

```bash
git add prisma/seed.ts package.json tests/db/seed.test.ts
git commit -m "feat: add local seed for two-user shared space"
```

### Task 4: Autenticación local y sesión por cookie

**Files:**
- Create: `lib/auth/password.ts`
- Create: `lib/auth/session.ts`
- Create: `app/api/auth/login/route.ts`
- Create: `app/api/auth/logout/route.ts`
- Create: `middleware.ts`
- Test: `tests/auth/login.test.ts`

**Step 1: Write the failing test**

```ts
// tests/auth/login.test.ts
import { describe, it, expect } from "vitest";
import { hashPassword, verifyPassword } from "@/lib/auth/password";

describe("password auth", () => {
  it("hashes and verifies", async () => {
    const hash = await hashPassword("secret123");
    expect(await verifyPassword("secret123", hash)).toBe(true);
  });
});
```

**Step 2: Run test to verify it fails**
Run: `npm run test -- tests/auth/login.test.ts`
Expected: FAIL because auth helpers do not exist.

**Step 3: Write minimal implementation**
Implementar bcrypt + cookie de sesión firmada con expiración.

**Step 4: Run test to verify it passes**
Run: `npm run test -- tests/auth/login.test.ts`
Expected: PASS.

**Step 5: Commit**

```bash
git add lib/auth/password.ts lib/auth/session.ts app/api/auth/login/route.ts app/api/auth/logout/route.ts middleware.ts tests/auth/login.test.ts
git commit -m "feat: add local auth and cookie session"
```

### Task 5: API de items (listar/agregar/completar/descartar)

**Files:**
- Create: `lib/validation/item.ts`
- Create: `app/api/items/route.ts`
- Create: `app/api/items/[id]/complete/route.ts`
- Create: `app/api/items/[id]/discard/route.ts`
- Test: `tests/api/items.test.ts`

**Step 1: Write the failing test**

```ts
// tests/api/items.test.ts
import { describe, it, expect } from "vitest";

describe("items api", () => {
  it("rejects duplicates by space/type/source/external_id", async () => {
    expect(true).toBe(false);
  });
});
```

**Step 2: Run test to verify it fails**
Run: `npm run test -- tests/api/items.test.ts`
Expected: FAIL.

**Step 3: Write minimal implementation**
Endpoints con validación Zod y scoping por `spaceId`.

**Step 4: Run test to verify it passes**
Run: `npm run test -- tests/api/items.test.ts`
Expected: PASS.

**Step 5: Commit**

```bash
git add lib/validation/item.ts app/api/items/route.ts app/api/items/[id]/complete/route.ts app/api/items/[id]/discard/route.ts tests/api/items.test.ts
git commit -m "feat: implement wishlist item api with duplicate protection"
```

### Task 6: Integración discovery TMDB y Open Library

**Files:**
- Create: `lib/providers/tmdb.ts`
- Create: `lib/providers/openlibrary.ts`
- Create: `lib/providers/discover.ts`
- Create: `app/api/discover/route.ts`
- Test: `tests/providers/discover.test.ts`

**Step 1: Write the failing test**

```ts
// tests/providers/discover.test.ts
import { describe, it, expect } from "vitest";
import { normalizeTypeLabel } from "@/lib/providers/discover";

describe("discover normalization", () => {
  it("maps comic keyword to comic type", () => {
    expect(normalizeTypeLabel("graphic novel")).toBe("comic");
  });
});
```

**Step 2: Run test to verify it fails**
Run: `npm run test -- tests/providers/discover.test.ts`
Expected: FAIL.

**Step 3: Write minimal implementation**
Adaptadores con shape común `{ title, poster_image, type, source, external_id }` y cache corta.

**Step 4: Run test to verify it passes**
Run: `npm run test -- tests/providers/discover.test.ts`
Expected: PASS.

**Step 5: Commit**

```bash
git add lib/providers/tmdb.ts lib/providers/openlibrary.ts lib/providers/discover.ts app/api/discover/route.ts tests/providers/discover.test.ts
git commit -m "feat: add discover adapters for tmdb and openlibrary"
```

### Task 7: UI base premium + navegación móvil/desktop

**Files:**
- Modify: `app/globals.css`
- Create: `components/layout/app-shell.tsx`
- Create: `components/layout/bottom-nav.tsx`
- Create: `components/layout/sidebar.tsx`
- Create: `app/(protected)/layout.tsx`
- Test: `tests/ui/navigation.test.tsx`

**Step 1: Write the failing test**

```tsx
import { render, screen } from "@testing-library/react";
import { AppShell } from "@/components/layout/app-shell";
import { it, expect } from "vitest";

it("renders nav labels in spanish", () => {
  render(<AppShell><div>ok</div></AppShell>);
  expect(screen.getByText("Inicio")).toBeTruthy();
});
```

**Step 2: Run test to verify it fails**
Run: `npm run test -- tests/ui/navigation.test.tsx`
Expected: FAIL.

**Step 3: Write minimal implementation**
Crear shell responsive con barra inferior y sidebar.

**Step 4: Run test to verify it passes**
Run: `npm run test -- tests/ui/navigation.test.tsx`
Expected: PASS.

**Step 5: Commit**

```bash
git add app/globals.css components/layout/app-shell.tsx components/layout/bottom-nav.tsx components/layout/sidebar.tsx app/(protected)/layout.tsx tests/ui/navigation.test.tsx
git commit -m "feat: add premium responsive app shell navigation"
```

### Task 8: Inicio con carruseles y modal de detalle

**Files:**
- Create: `components/discover/content-carousel.tsx`
- Create: `components/discover/content-card.tsx`
- Create: `components/discover/content-detail-modal.tsx`
- Modify: `app/(protected)/page.tsx`
- Test: `tests/ui/discover.test.tsx`

**Step 1: Write the failing test**

```tsx
import { render, screen } from "@testing-library/react";
import HomePage from "@/app/(protected)/page";
import { it, expect } from "vitest";

it("shows discover rails", () => {
  render(<HomePage />);
  expect(screen.getByText("Tendencias")).toBeTruthy();
});
```

**Step 2: Run test to verify it fails**
Run: `npm run test -- tests/ui/discover.test.tsx`
Expected: FAIL.

**Step 3: Write minimal implementation**
Renderizar filas horizontales, botón guardar y estado "Ya en wishlist".

**Step 4: Run test to verify it passes**
Run: `npm run test -- tests/ui/discover.test.tsx`
Expected: PASS.

**Step 5: Commit**

```bash
git add components/discover/content-carousel.tsx components/discover/content-card.tsx components/discover/content-detail-modal.tsx app/(protected)/page.tsx tests/ui/discover.test.tsx
git commit -m "feat: implement discover home with carousels and modal"
```

### Task 9: Wishlist por tipo + swipe actions + historial

**Files:**
- Create: `app/(protected)/peliculas/page.tsx`
- Create: `app/(protected)/series/page.tsx`
- Create: `app/(protected)/libros/page.tsx`
- Create: `app/(protected)/comics/page.tsx`
- Create: `app/(protected)/historial/page.tsx`
- Create: `components/wishlist/wishlist-list.tsx`
- Create: `components/wishlist/wishlist-row.tsx`
- Test: `tests/ui/wishlist.test.tsx`

**Step 1: Write the failing test**

```tsx
import { render, screen } from "@testing-library/react";
import { WishlistRow } from "@/components/wishlist/wishlist-row";
import { it, expect } from "vitest";

it("renders completar button", () => {
  render(<WishlistRow item={{ id:"1", title:"X" } as any} onComplete={() => {}} onDiscard={() => {}} />);
  expect(screen.getByText("Visto/Leído")).toBeTruthy();
});
```

**Step 2: Run test to verify it fails**
Run: `npm run test -- tests/ui/wishlist.test.tsx`
Expected: FAIL.

**Step 3: Write minimal implementation**
Implementar listas por tipo, botón visible y gesto swipe con confirmación ligera.

**Step 4: Run test to verify it passes**
Run: `npm run test -- tests/ui/wishlist.test.tsx`
Expected: PASS.

**Step 5: Commit**

```bash
git add app/(protected)/peliculas/page.tsx app/(protected)/series/page.tsx app/(protected)/libros/page.tsx app/(protected)/comics/page.tsx app/(protected)/historial/page.tsx components/wishlist/wishlist-list.tsx components/wishlist/wishlist-row.tsx tests/ui/wishlist.test.tsx
git commit -m "feat: add typed wishlist pages with swipe and history"
```

### Task 10: Documentación, checklist final y verificación

**Files:**
- Create: `README.md`
- Create: `docs/checklists/mvp-validation.md`

**Step 1: Write the failing test**

```ts
// tests/docs/readme.test.ts
import { readFileSync } from "node:fs";
import { describe, it, expect } from "vitest";

describe("readme", () => {
  it("contains local setup instructions", () => {
    const content = readFileSync("README.md", "utf8");
    expect(content.includes("npm install")).toBe(true);
    expect(content.includes("prisma migrate dev")).toBe(true);
  });
});
```

**Step 2: Run test to verify it fails**
Run: `npm run test -- tests/docs/readme.test.ts`
Expected: FAIL because README is missing.

**Step 3: Write minimal implementation**
Documentar setup local, `.env`, migraciones, seed, ejecución y claves TMDB.

**Step 4: Run test to verify it passes**
Run: `npm run test -- tests/docs/readme.test.ts && npm run test && npm run build`
Expected: PASS/BUILD SUCCESS.

**Step 5: Commit**

```bash
git add README.md docs/checklists/mvp-validation.md tests/docs/readme.test.ts
git commit -m "docs: add setup guide and mvp validation checklist"
```

## Global verification gates
- Run: `npm run lint`
- Run: `npm run test`
- Run: `npm run build`
- Manual smoke:
  - Inicio muestra posters sin buscar
  - Wishlist separada por 4 tipos
  - Se muestra quién agregó + fecha
  - Completar por botón y swipe mueve a historial
  - Dos usuarios comparten el mismo space
  - No duplicados
  - UX correcta en móvil y desktop
