# Diseño MVP - Wishlist Streaming Compartida

**Fecha:** 2026-02-21
**Estado:** Aprobado por usuario

## Objetivo
Construir una web app tipo "Netflix privado" para dos usuarios (hogar compartido), en español, mobile-first, con UI moderna y llamativa, que permita descubrir contenido y guardar/gestionar wishlist separada por tipo.

## Arquitectura
- Next.js (App Router) + TypeScript en una sola aplicación (frontend + API route handlers).
- SQLite local como base de datos.
- Prisma para schema, migraciones y acceso a datos.
- Autenticación local email/password con sesión por cookie segura.
- PWA instalable (manifest + service worker básico).

## Navegación y UX
- Mobile: barra inferior con Inicio, Películas, Series, Libros, Cómics, Historial.
- Desktop: sidebar equivalente.
- Inicio con carruseles: Tendencias, Recientes, Mejor valoradas.
- Detalle en modal con poster, metadata y botón "Guardar en Wishlist".
- Wishlist separada por tipo.
- Swipe en wishlist:
  - derecha: completar (visto/leído)
  - izquierda: descartar/quitar con confirmación ligera
- Botón visible de completar, además de swipe.

## Diseño visual
- Estética streaming premium, fondo oscuro con acentos cálidos.
- Tarjetas de poster con profundidad, transiciones sutiles y feedback táctil.
- Skeleton loaders, lazy loading de imágenes y estados vacíos cuidados.

## Datos y reglas
### Tipos
- movie
- tv
- book
- comic

### Campos por item
- title
- poster_image
- type
- source
- external_id
- added_by
- added_at
- status: wishlist | completed | discarded
- completed_by (nullable)
- completed_at (nullable)
- notes (nullable)

### Reglas
- No duplicar por `space_id + type + source + external_id`.
- Completar actualiza `status=completed` + metadatos de completado.
- Descartar usa `status=discarded` para historial.

## Modelo multiusuario
- users
- spaces
- space_members
- items

Ambos usuarios pertenecen al mismo `space` y ven la misma wishlist.

## Integraciones externas
- TMDB para películas/series (trending, popular/now_playing, top_rated, búsqueda).
- Open Library para libros y cómics (MVP) usando subjects/keywords (`comic`, `graphic novel`, `manga`) y covers.
- ComicVine queda como mejora futura opcional.

## API interna
- GET `/api/items?type=&status=`
- POST `/api/items`
- PATCH `/api/items/:id/complete`
- PATCH `/api/items/:id/discard`
- PATCH `/api/items/:id/restore`
- GET `/api/discover`

## Rendimiento y seguridad
- Cache en servidor para feeds de discover.
- Lazy loading y skeletons.
- Hash de password (bcrypt).
- Cookie de sesión `httpOnly` + `sameSite=lax`.
- Validación de payloads.
- Scoping obligatorio por `space_id`.

## QA MVP
- API tests: crear, duplicados, completar, descartar, listar por tipo/status.
- UI tests mínimos: guardar, completar, estado "Ya en wishlist".

## Entregables
- App funcional responsive (móvil y PC), en español.
- README con setup local, .env, migraciones y ejecución.
- Checklist final contra requisitos.
