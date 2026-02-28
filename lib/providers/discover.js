import {
  buildTmdbPath,
  discoverTmdbByGenre,
  discoverTmdbByProvider,
  fetchTmdb,
  fetchTmdbItems,
  hasTmdbApiKey,
  normalizeTmdb,
  TMDB_MOVIE_GENRES,
  TMDB_PROVIDER_IDS,
  TMDB_TV_GENRES
} from "./tmdb.js";
import {
  discoverBooks,
  discoverComics,
  discoverOpenLibrarySubject,
  OPENLIBRARY_BOOK_SUBJECTS,
  OPENLIBRARY_COMIC_SUBJECTS
} from "./openlibrary.js";
import { buildExplorePayload } from "./explore-sections.js";

function shuffle(list) {
  return [...list].sort(() => Math.random() - 0.5);
}

async function safeList(promiseFactory) {
  try {
    return await promiseFactory();
  } catch {
    return [];
  }
}

function section(id, title, items) {
  return { id, title, items: items || [] };
}

function tmdbSectionDef(id, title, loader) {
  return { id, title, loader };
}

function heroFor(pageType, title, subtitle) {
  return {
    pageType,
    title,
    subtitle
  };
}

function platformSections(kind) {
  return [
    { id: "netflix", title: "Netflix", provider: TMDB_PROVIDER_IDS.NETFLIX },
    { id: "disney", title: "Disney+", provider: TMDB_PROVIDER_IDS.DISNEY_PLUS },
    { id: "prime", title: "Prime Video", provider: TMDB_PROVIDER_IDS.PRIME_VIDEO },
    { id: "max", title: "Max", provider: TMDB_PROVIDER_IDS.MAX },
    { id: "apple", title: "Apple TV+", provider: TMDB_PROVIDER_IDS.APPLE_TV_PLUS }
  ].map((item) => ({
    ...item,
    kind
  }));
}

function mixPreviewList(...lists) {
  return shuffle(lists.flat().filter(Boolean)).slice(0, 24);
}

function openLibrarySectionDef({ id, title, subject, type, limit = 24 }) {
  return tmdbSectionDef(id, title, (page = 1) =>
    safeList(() => discoverOpenLibrarySubject(subject, type, limit, page))
  );
}

export function dedupeContentItems(items = []) {
  const seen = new Set();
  const unique = [];
  for (const item of items) {
    if (!item) continue;
    const key = `${item.type || ""}:${item.source || ""}:${item.external_id || ""}`;
    if (seen.has(key)) continue;
    seen.add(key);
    unique.push(item);
  }
  return unique;
}

export function shouldShowTmdbConfigHint({ tmdbEnabled, pageType }) {
  return !tmdbEnabled && (pageType === "movies" || pageType === "series");
}

function toValidDate(value) {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function itemReleasedAfter(item, cutoffDate) {
  if (!cutoffDate || !item) return false;
  if (item.released_at) {
    const d = new Date(item.released_at);
    if (!Number.isNaN(d.getTime())) return d > cutoffDate;
  }
  if (typeof item.published_at_year === "number" && Number.isFinite(item.published_at_year)) {
    return item.published_at_year > cutoffDate.getFullYear();
  }
  const year = Number(item.year || 0);
  if (!Number.isFinite(year) || !year) return false;
  return year > cutoffDate.getFullYear();
}

function buildStableRotation(items = [], seed = 0) {
  if (!items.length) return [];
  const offset = Math.abs(seed) % items.length;
  return [...items.slice(offset), ...items.slice(0, offset)];
}

export function buildLastVisitHomeSection({ sections = [], lastVisitedAt = null, now = new Date() } = {}) {
  const baseSections = (sections || []).filter((section) => section?.items?.length);
  if (!baseSections.length) return null;

  const cutoff = toValidDate(lastVisitedAt);
  const allItems = dedupeContentItems(baseSections.flatMap((section) => section.items || []));
  if (!allItems.length) return null;

  const freshItems = cutoff ? allItems.filter((item) => itemReleasedAfter(item, cutoff)) : [];
  const fallbackRecent = allItems.filter((item) => {
    const year = Number(item?.year || 0);
    if (!year) return false;
    if (!cutoff) return year >= now.getFullYear() - 1;
    return year >= cutoff.getFullYear() - 1;
  });

  const seed = cutoff
    ? Math.floor((now.getTime() - cutoff.getTime()) / (1000 * 60 * 60))
    : Math.floor(now.getTime() / (1000 * 60 * 60 * 24));
  const rotatedPool = buildStableRotation(
    dedupeContentItems([...freshItems, ...fallbackRecent, ...allItems]),
    seed
  ).slice(0, 24);

  return {
    id: "home-new-since-last-visit",
    title: cutoff ? "Novedades desde tu última visita" : "Novedades para ti",
    items: rotatedPool,
    supportsIncremental: false
  };
}

export function buildHomePreviewPayload({
  mixedTrending = [],
  mixedRecent = [],
  mixedTop = [],
  movies = [],
  series = [],
  books = [],
  comics = []
}) {
  return buildExplorePayload({
    hero: heroFor("home", "Descubre algo para hoy", "Peliculas, series, libros y comics en un solo lugar"),
    sections: [
      section("movies-preview", "Peliculas para empezar", movies),
      section("series-preview", "Series para empezar", series),
      section("books-preview", "Libros para empezar", books),
      section("comics-preview", "Comics para empezar", comics),
      section("trending", "Tendencias ahora", mixedTrending),
      section("recent", "Recientes", mixedRecent),
      section("top", "Mejor valoradas", mixedTop)
    ]
  });
}

export async function discoverHome({ lastVisitedAt = null } = {}) {
  const tmdbEnabled = hasTmdbApiKey();
  const sections = await buildHomeSections();
  const lastVisitSection = buildLastVisitHomeSection({ sections, lastVisitedAt, now: new Date() });
  return buildExplorePayload({
    hero: heroFor("home", "Descubre algo para hoy", "Peliculas, series, libros y comics en un solo lugar"),
    sections: lastVisitSection ? [lastVisitSection, ...sections] : sections,
    meta: { tmdbEnabled }
  });
}

function buildMovieSectionDefs() {
  return [
    tmdbSectionDef("trending", "Tendencias", (page = 1) =>
      safeList(() => fetchTmdbItems(buildTmdbPath("/trending/movie/week", { page }), "movie"))
    ),
    tmdbSectionDef("recent", "En cines / recientes", (page = 1) =>
      safeList(() => fetchTmdbItems(buildTmdbPath("/movie/now_playing", { page }), "movie"))
    ),
    tmdbSectionDef("top-rated", "Mejor valoradas", (page = 1) =>
      safeList(() => fetchTmdbItems(buildTmdbPath("/movie/top_rated", { page }), "movie"))
    ),
    tmdbSectionDef("action", "Accion", (page = 1) =>
      safeList(() => discoverTmdbByGenre("movie", TMDB_MOVIE_GENRES.ACTION, { page }))
    ),
    tmdbSectionDef("drama", "Drama", (page = 1) =>
      safeList(() => discoverTmdbByGenre("movie", TMDB_MOVIE_GENRES.DRAMA, { page }))
    ),
    tmdbSectionDef("comedy", "Comedia", (page = 1) =>
      safeList(() => discoverTmdbByGenre("movie", TMDB_MOVIE_GENRES.COMEDY, { page }))
    ),
    tmdbSectionDef("family", "Familiar", (page = 1) =>
      safeList(() => discoverTmdbByGenre("movie", TMDB_MOVIE_GENRES.FAMILY, { page }))
    ),
    tmdbSectionDef("animation", "Animacion", (page = 1) =>
      safeList(() => discoverTmdbByGenre("movie", TMDB_MOVIE_GENRES.ANIMATION, { page }))
    ),
    tmdbSectionDef("horror", "Terror", (page = 1) =>
      safeList(() => discoverTmdbByGenre("movie", TMDB_MOVIE_GENRES.HORROR, { page }))
    ),
    tmdbSectionDef("scifi", "Ciencia ficcion", (page = 1) =>
      safeList(() => discoverTmdbByGenre("movie", TMDB_MOVIE_GENRES.SCI_FI, { page }))
    ),
    tmdbSectionDef("anime", "Anime", (page = 1) =>
      safeList(() =>
        fetchTmdbItems(
          buildTmdbPath("/discover/movie", {
            sort_by: "popularity.desc",
            with_genres: TMDB_MOVIE_GENRES.ANIMATION,
            with_original_language: "ja",
            page
          }),
          "movie"
        )
      )
    ),
    tmdbSectionDef("mubi-recent", "Recientes en MUBI", (page = 1) =>
      safeList(() =>
        discoverTmdbByProvider("movie", TMDB_PROVIDER_IDS.MUBI, {
          page,
          sort_by: "primary_release_date.desc"
        })
      )
    ),
    tmdbSectionDef("mubi-top-rated", "Mejor valoradas en MUBI", (page = 1) =>
      safeList(() =>
        discoverTmdbByProvider("movie", TMDB_PROVIDER_IDS.MUBI, {
          page,
          sort_by: "vote_average.desc",
          "vote_count.gte": 200
        })
      )
    ),
    ...platformSections("movie").map((platform) =>
      tmdbSectionDef(platform.id, platform.title, (page = 1) =>
        safeList(() => discoverTmdbByProvider("movie", platform.provider, { page }))
      )
    )
  ];
}

function buildSeriesSectionDefs() {
  return [
    tmdbSectionDef("trending", "Tendencias", (page = 1) =>
      safeList(() => fetchTmdbItems(buildTmdbPath("/trending/tv/week", { page }), "tv"))
    ),
    tmdbSectionDef("recent", "En emision / recientes", (page = 1) =>
      safeList(() => fetchTmdbItems(buildTmdbPath("/tv/on_the_air", { page }), "tv"))
    ),
    tmdbSectionDef("top-rated", "Mejor valoradas", (page = 1) =>
      safeList(() => fetchTmdbItems(buildTmdbPath("/tv/top_rated", { page }), "tv"))
    ),
    tmdbSectionDef("drama", "Drama", (page = 1) =>
      safeList(() => discoverTmdbByGenre("tv", TMDB_TV_GENRES.DRAMA, { page }))
    ),
    tmdbSectionDef("comedy", "Comedia", (page = 1) =>
      safeList(() => discoverTmdbByGenre("tv", TMDB_TV_GENRES.COMEDY, { page }))
    ),
    tmdbSectionDef("crime", "Crimen", (page = 1) =>
      safeList(() => discoverTmdbByGenre("tv", TMDB_TV_GENRES.CRIME, { page }))
    ),
    tmdbSectionDef("animated", "Animadas", (page = 1) =>
      safeList(() => discoverTmdbByGenre("tv", TMDB_TV_GENRES.ANIMATION, { page }))
    ),
    tmdbSectionDef("scifi-fantasy", "Sci-Fi & Fantasy", (page = 1) =>
      safeList(() => discoverTmdbByGenre("tv", TMDB_TV_GENRES.SCI_FI_FANTASY, { page }))
    ),
    tmdbSectionDef("family", "Familiar", (page = 1) =>
      safeList(() => discoverTmdbByGenre("tv", TMDB_TV_GENRES.FAMILY, { page }))
    ),
    tmdbSectionDef("anime", "Anime", (page = 1) =>
      safeList(() =>
        fetchTmdbItems(
          buildTmdbPath("/discover/tv", {
            sort_by: "popularity.desc",
            with_genres: TMDB_TV_GENRES.ANIMATION,
            with_original_language: "ja",
            page
          }),
          "tv"
        )
      )
    ),
    ...platformSections("tv").map((platform) =>
      tmdbSectionDef(platform.id, platform.title, (page = 1) =>
        safeList(() => discoverTmdbByProvider("tv", platform.provider, { page }))
      )
    )
  ];
}

async function buildTmdbSections(defs, page = 1) {
  return Promise.all(
    defs.map(async (def) => section(def.id, def.title, await def.loader(page)))
  );
}

async function resolveTmdbSectionPage(defs, sectionId, page = 1) {
  const def = defs.find((item) => item.id === sectionId);
  if (!def) return null;
  return section(def.id, def.title, await def.loader(page));
}

async function buildMovieSections() {
  return buildTmdbSections(buildMovieSectionDefs(), 1);
}

async function buildSeriesSections() {
  return buildTmdbSections(buildSeriesSectionDefs(), 1);
}

async function buildOpenLibrarySections(configs, forcedType) {
  const built = await Promise.all(
    configs.map(async (cfg) => {
      const items = await safeList(() => discoverOpenLibrarySubject(cfg.slug, forcedType, 24));
      return section(cfg.id, cfg.title, items);
    })
  );

  // Add a mixed row to make the page feel less flat when some subjects are sparse.
  const mixed = dedupeContentItems(shuffle(built.flatMap((row) => row.items || []))).slice(0, 20);
  return [section("featured-mix", "Seleccion para ti", mixed), ...built];
}

function buildHomeSectionDefs() {
  return [
    tmdbSectionDef("home-movies-trending", "Peliculas en tendencia", (page = 1) =>
      safeList(() => fetchTmdbItems(buildTmdbPath("/trending/movie/week", { page }), "movie"))
    ),
    tmdbSectionDef("home-series-trending", "Series en tendencia", (page = 1) =>
      safeList(() => fetchTmdbItems(buildTmdbPath("/trending/tv/week", { page }), "tv"))
    ),
    openLibrarySectionDef({
      id: "home-books-fiction",
      title: "Libros de ficcion popular",
      subject: "fiction",
      type: "book"
    }),
    openLibrarySectionDef({
      id: "home-comics-manga",
      title: "Manga para empezar",
      subject: "manga",
      type: "comic"
    }),
    tmdbSectionDef("home-movies-mubi-recent", "Cine de arte: recientes en MUBI", (page = 1) =>
      safeList(() =>
        discoverTmdbByProvider("movie", TMDB_PROVIDER_IDS.MUBI, {
          page,
          sort_by: "primary_release_date.desc"
        })
      )
    ),
    tmdbSectionDef("home-movies-recent", "Peliculas recientes", (page = 1) =>
      safeList(() => fetchTmdbItems(buildTmdbPath("/movie/now_playing", { page }), "movie"))
    ),
    tmdbSectionDef("home-series-top-rated", "Series mejor valoradas", (page = 1) =>
      safeList(() => fetchTmdbItems(buildTmdbPath("/tv/top_rated", { page }), "tv"))
    ),
    openLibrarySectionDef({
      id: "home-books-fantasy",
      title: "Libros de fantasia",
      subject: "fantasy",
      type: "book"
    }),
    openLibrarySectionDef({
      id: "home-comics-graphic-novels",
      title: "Graphic novels",
      subject: "graphic_novels",
      type: "comic"
    }),
    tmdbSectionDef("home-movies-comedy", "Peliculas de comedia", (page = 1) =>
      safeList(() => discoverTmdbByGenre("movie", TMDB_MOVIE_GENRES.COMEDY, { page }))
    ),
    tmdbSectionDef("home-series-netflix", "Series en Netflix", (page = 1) =>
      safeList(() => discoverTmdbByProvider("tv", TMDB_PROVIDER_IDS.NETFLIX, { page }))
    ),
    openLibrarySectionDef({
      id: "home-books-mystery",
      title: "Libros de misterio",
      subject: "mystery",
      type: "book"
    }),
    openLibrarySectionDef({
      id: "home-comics-superheroes",
      title: "Comics de superheroes",
      subject: "superheroes",
      type: "comic"
    }),
    tmdbSectionDef("home-movies-drama", "Peliculas de drama", (page = 1) =>
      safeList(() => discoverTmdbByGenre("movie", TMDB_MOVIE_GENRES.DRAMA, { page }))
    ),
    tmdbSectionDef("home-movies-mubi-top-rated", "Cine de arte: mejor valoradas en MUBI", (page = 1) =>
      safeList(() =>
        discoverTmdbByProvider("movie", TMDB_PROVIDER_IDS.MUBI, {
          page,
          sort_by: "vote_average.desc",
          "vote_count.gte": 200
        })
      )
    ),
    tmdbSectionDef("home-series-disney", "Series en Disney+", (page = 1) =>
      safeList(() => discoverTmdbByProvider("tv", TMDB_PROVIDER_IDS.DISNEY_PLUS, { page }))
    ),
    openLibrarySectionDef({
      id: "home-books-scifi",
      title: "Libros de ciencia ficcion",
      subject: "science_fiction",
      type: "book"
    }),
    openLibrarySectionDef({
      id: "home-comics-comic-books-strips",
      title: "Comic books & strips",
      subject: "comic_books_strips",
      type: "comic"
    })
  ];
}

async function buildHomeSections() {
  return buildTmdbSections(buildHomeSectionDefs(), 1);
}

export async function discoverHomeSectionPage(sectionId, page = 1) {
  return resolveTmdbSectionPage(buildHomeSectionDefs(), sectionId, page);
}

export async function discoverMoviesPage() {
  const tmdbEnabled = hasTmdbApiKey();
  return buildExplorePayload({
    hero: heroFor("movies", "Explorar peliculas", "Tendencias, generos y plataformas"),
    sections: await buildMovieSections(),
    meta: { tmdbEnabled }
  });
}

export async function discoverMoviesSectionPage(sectionId, page = 1) {
  return resolveTmdbSectionPage(buildMovieSectionDefs(), sectionId, page);
}

export async function discoverSeriesPage() {
  const tmdbEnabled = hasTmdbApiKey();
  return buildExplorePayload({
    hero: heroFor("series", "Explorar series", "Secciones por genero, anime y plataformas"),
    sections: await buildSeriesSections(),
    meta: { tmdbEnabled }
  });
}

export async function discoverSeriesSectionPage(sectionId, page = 1) {
  return resolveTmdbSectionPage(buildSeriesSectionDefs(), sectionId, page);
}

export async function discoverBooksPage() {
  return buildExplorePayload({
    hero: heroFor("books", "Explorar libros", "Categorias para descubrir y guardar"),
    sections: await buildOpenLibrarySections(OPENLIBRARY_BOOK_SUBJECTS, "book"),
    meta: { tmdbEnabled: hasTmdbApiKey() }
  });
}

export async function discoverComicsPage() {
  return buildExplorePayload({
    hero: heroFor("comics", "Explorar comics", "Manga, graphic novels y mas"),
    sections: await buildOpenLibrarySections(OPENLIBRARY_COMIC_SUBJECTS, "comic"),
    meta: { tmdbEnabled: hasTmdbApiKey() }
  });
}
