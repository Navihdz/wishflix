import { NextResponse } from "next/server";
import { readCache, writeCache } from "@/lib/cache";
import { getCurrentUserContext } from "@/lib/auth/current-user";
import { dedupeContentItems } from "@/lib/providers/discover";
import { searchTmdb } from "@/lib/providers/tmdb";
import { searchOpenLibrary } from "@/lib/providers/openlibrary";

function getScope(value) {
  const scope = String(value || "home").trim().toLowerCase();
  if (["home", "movies", "series", "books", "comics"].includes(scope)) return scope;
  return "home";
}

function limitResults(items, limit = 36) {
  return dedupeContentItems(items).slice(0, limit);
}

export async function GET(request) {
  const ctx = await getCurrentUserContext();
  if (!ctx) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const q = String(searchParams.get("q") || "").trim();
  const scope = getScope(searchParams.get("scope"));
  if (!q) return NextResponse.json({ items: [] });

  const cacheKey = `search:${scope}:${q.toLowerCase()}`;
  const cached = readCache(cacheKey);
  if (cached) return NextResponse.json(cached);

  let items = [];
  if (scope === "movies") {
    items = await searchTmdb("movie", q);
  } else if (scope === "series") {
    items = await searchTmdb("tv", q);
  } else if (scope === "books") {
    items = await searchOpenLibrary(q, 30, "book");
  } else if (scope === "comics") {
    items = await searchOpenLibrary(q, 30, "comic");
  } else {
    const [movies, series, books, comics] = await Promise.all([
      searchTmdb("movie", q),
      searchTmdb("tv", q),
      searchOpenLibrary(q, 20, "book"),
      searchOpenLibrary(q, 20, "comic")
    ]);
    items = limitResults([...movies, ...series, ...books, ...comics], 48);
  }

  const payload = { items: limitResults(items, scope === "home" ? 48 : 36) };
  writeCache(cacheKey, payload, 1000 * 60 * 5);
  return NextResponse.json(payload);
}
