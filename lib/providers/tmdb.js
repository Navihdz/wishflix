function posterFromTmdb(path) {
  if (!path) return null;
  return `https://image.tmdb.org/t/p/w500${path}`;
}

const EXTERNAL_API_TIMEOUT_MS = Number(process.env.EXTERNAL_API_TIMEOUT_MS || 8000);

export const TMDB_PROVIDER_IDS = {
  NETFLIX: 8,
  MUBI: 11,
  PRIME_VIDEO: 9,
  DISNEY_PLUS: 337,
  MAX: 1899,
  APPLE_TV_PLUS: 350
};

export const TMDB_MOVIE_GENRES = {
  ACTION: 28,
  COMEDY: 35,
  DRAMA: 18,
  FAMILY: 10751,
  ANIMATION: 16,
  HORROR: 27,
  SCI_FI: 878
};

export const TMDB_TV_GENRES = {
  DRAMA: 18,
  COMEDY: 35,
  CRIME: 80,
  FAMILY: 10751,
  ANIMATION: 16,
  SCI_FI_FANTASY: 10765
};

export function hasTmdbApiKey() {
  return Boolean(process.env.TMDB_API_KEY);
}

export function buildTmdbPath(path, params = {}) {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === "") continue;
    query.set(key, String(value));
  }
  const q = query.toString();
  return q ? `${path}${path.includes("?") ? "&" : "?"}${q}` : path;
}

export async function fetchTmdb(path) {
  const key = process.env.TMDB_API_KEY;
  if (!key) return { results: [] };

  const url = `https://api.themoviedb.org/3${path}${path.includes("?") ? "&" : "?"}api_key=${key}&language=es-ES`;
  try {
    const response = await fetch(url, {
      next: { revalidate: 900 },
      signal: AbortSignal.timeout(EXTERNAL_API_TIMEOUT_MS)
    });
    if (!response.ok) return { results: [] };
    return response.json();
  } catch {
    return { results: [] };
  }
}

export async function fetchTmdbItems(path, type) {
  const data = await fetchTmdb(path);
  return normalizeTmdb(data.results, type);
}

export async function discoverTmdbByGenre(kind, genreId, extra = {}) {
  const path = buildTmdbPath(`/discover/${kind}`, {
    sort_by: "popularity.desc",
    include_adult: false,
    include_video: false,
    with_genres: genreId,
    page: 1,
    ...extra
  });
  return fetchTmdbItems(path, kind === "movie" ? "movie" : "tv");
}

export async function discoverTmdbByProvider(kind, providerId, extra = {}) {
  const path = buildTmdbPath(`/discover/${kind}`, {
    sort_by: "popularity.desc",
    include_adult: false,
    watch_region: "US",
    with_watch_providers: providerId,
    with_watch_monetization_types: "flatrate",
    page: 1,
    ...extra
  });
  return fetchTmdbItems(path, kind === "movie" ? "movie" : "tv");
}

export async function searchTmdb(kind, query, page = 1) {
  const q = String(query || "").trim();
  if (!q) return [];
  const path = buildTmdbPath(`/search/${kind}`, {
    query: q,
    include_adult: false,
    page
  });
  return fetchTmdbItems(path, kind === "movie" ? "movie" : "tv");
}

export function normalizeTmdb(items, type) {
  return (items || []).slice(0, 20).map((item) => ({
    id: String(item.id),
    title: item.title || item.name || "Sin titulo",
    poster_image: posterFromTmdb(item.poster_path),
    type,
    source: "tmdb",
    external_id: String(item.id),
    year: (item.release_date || item.first_air_date || "").slice(0, 4),
    released_at: item.release_date || item.first_air_date || "",
    overview: item.overview || ""
  }));
}
