# Rediseño UX de Exploración y Navegación (WishFlix Privado)

## Contexto

La app ya permite descubrimiento en `Inicio` y wishlist por tipo, pero la experiencia actual mezcla poco contenido y no deja claro el flujo "explorar vs guardar". El usuario quiere una experiencia más tipo Netflix:

- `Inicio` enfocado en descubrir contenido.
- Botones grandes para entrar a exploración por tipo.
- Sidebar izquierdo colapsable para navegar la wishlist (películas, series, libros, cómics).
- Subpáginas dedicadas de exploración con múltiples carruseles por categoría.
- Secciones por plataformas (Netflix, Disney+, etc.) en películas/series.
- Cómics visibles como sección real, no ocultos dentro del mezclado de `Inicio`.

## Objetivos

- Separar claramente la navegación de `Explorar` y `Wishlist`.
- Hacer `Inicio` más visual y útil como hub.
- Agregar exploración profunda por tipo con filas horizontales.
- Mantener la acción de "Guardar" y prevención de duplicados desde cualquier carrusel.
- Conservar MVP simple (sin microservicios, sin arquitectura compleja).

## Arquitectura de Navegación (Aprobada)

### Inicio (hub de exploración)

- `"/inicio"` será la pantalla principal de descubrimiento.
- Mostrará un hero visual + botones grandes:
  - `Explorar Películas`
  - `Explorar Series`
  - `Explorar Libros`
  - `Explorar Cómics`
- Debajo, filas de preview mixtas para mantener sensación de contenido vivo.

### Subpáginas dedicadas de exploración

- `"/explorar/peliculas"`
- `"/explorar/series"`
- `"/explorar/libros"`
- `"/explorar/comics"`

Estas páginas mostrarán múltiples carruseles horizontales por categorías reales del proveedor.

### Wishlist (se mantiene por tipo)

Las páginas existentes siguen representando wishlist:

- `"/peliculas"`
- `"/series"`
- `"/libros"`
- `"/comics"`
- `"/historial"`

## Sidebar / Navegación

### Sidebar desktop (colapsable)

Grupos:

- `Explorar`
  - Inicio
  - Explorar Películas
  - Explorar Series
  - Explorar Libros
  - Explorar Cómics
- `Mi Wishlist`
  - Películas
  - Series
  - Libros
  - Cómics
- Historial
- Salir

El sidebar debe permitir colapsar/expandir (íconos cuando está colapsado, texto + íconos al expandirse).

### Mobile

- Mantener `bottom-nav` simple (`Inicio`, `Wishlist`, `Historial` o equivalente compacto).
- El acceso a exploración detallada por tipo ocurre desde `Inicio` (botones grandes).

## Exploración por Tipo (Carruseles)

## Películas (TMDB)

Filas objetivo MVP:

- Tendencias
- En cines / Recientes
- Mejor valoradas
- Acción
- Drama
- Comedia
- Familiar
- Animación
- Terror
- Ciencia ficción
- Anime (aproximado según datos disponibles en TMDB)
- Netflix
- Disney+
- Prime Video
- Max
- Apple TV+

## Series (TMDB)

Filas objetivo MVP:

- Tendencias
- En emisión / Recientes
- Mejor valoradas
- Drama
- Comedia
- Crimen
- Animadas
- Sci-Fi & Fantasy
- Familiar
- Anime
- Netflix
- Disney+
- Prime Video
- Max
- Apple TV+

## Libros (Open Library)

Filas objetivo MVP:

- Ficción popular
- Fantasía
- Ciencia ficción
- Romance
- Misterio
- Historia
- Juvenil
- Clásicos
- Recientes (aproximado)
- Tendencias / selección curada

## Cómics (Open Library)

Filas objetivo MVP:

- Comic books & strips
- Graphic novels
- Manga
- Superheroes (si el subject existe)
- Fantasy comics
- Sci-fi comics
- Kids comics
- Popular / selección

Si alguna categoría no responde, la UI debe degradarse ocultando esa fila, sin romper la página.

## Arquitectura Técnica (Aprobada)

### Endpoints nuevos de discover

Mantener:

- `GET /api/discover` (hub/mixto para `Inicio`)

Agregar:

- `GET /api/discover/movies`
- `GET /api/discover/series`
- `GET /api/discover/books`
- `GET /api/discover/comics`

Formato esperado:

```json
{
  "hero": {},
  "sections": [
    { "id": "trending", "title": "Tendencias", "items": [] }
  ]
}
```

### Proveedor TMDB

Extender `lib/providers/tmdb.js` para:

- Discover por género.
- Discover por proveedor/plataforma (`watch_provider`) con `watch_region=US`.
- Reusar normalización actual.

Nota UX:

- Las filas por plataforma representan "disponible en proveedor" según TMDB, no necesariamente contenido original de esa plataforma.

### Proveedor Open Library

Extender `lib/providers/openlibrary.js` con helpers por `subject` para construir filas de libros y cómics.

### UI reutilizable de exploración

Crear un componente genérico de rails para:

- Hero
- Fila horizontal por sección
- Modal de detalle
- Guardar / Ya en wishlist

`Inicio` usa versión hub; `explorar/*` usa versión completa.

### Caché

Mantener caché en memoria (`lib/cache.js`) con claves separadas:

- `discover-home`
- `discover-movies`
- `discover-series`
- `discover-books`
- `discover-comics`

TTL inicial: 10 minutos.

## UX / Rendimiento / Errores

- Hero visual y botones grandes tipo streaming.
- Skeleton loaders por fila.
- Placeholder para portadas faltantes.
- Ocultar filas que fallan individualmente.
- Mensaje de error global con reintento si falla todo el endpoint.
- Si falta `TMDB_API_KEY`, películas/series muestran aviso útil y libros/cómics siguen funcionando.
- Lazy loading de imágenes y límites por fila (12-20 ítems) para mantener fluidez.

## Validación de Aceptación

- `Inicio` muestra botones grandes para explorar por tipo.
- Cada botón navega a subpágina dedicada con múltiples carruseles.
- Películas/series muestran categorías por género y por plataforma.
- Libros/cómics muestran categorías separadas y cómics visibles.
- Guardar desde carruseles evita duplicados.
- Sidebar desktop se puede colapsar/expandir.
- Wishlist sigue separada por tipo.

## Notas

- Este rediseño mantiene el MVP simple y amplía la experiencia de descubrimiento sin mezclar wishlist y explorar en la misma pantalla.
- Se prioriza una experiencia visual estilo streaming con navegación clara en móvil y desktop.
