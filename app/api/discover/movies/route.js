import { NextResponse } from "next/server";
import { discoverMoviesPage, discoverMoviesSectionPage } from "@/lib/providers/discover";
import { readCache, writeCache } from "@/lib/cache";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const sectionId = String(searchParams.get("section") || "").trim();
  const pageParam = Number(searchParams.get("page") || "1");

  if (sectionId) {
    const page = Number.isFinite(pageParam) && pageParam > 0 ? Math.floor(pageParam) : 1;
    const key = `discover-movies:${sectionId}:${page}`;
    const cachedSection = readCache(key);
    if (cachedSection) return NextResponse.json(cachedSection);

    const section = await discoverMoviesSectionPage(sectionId, page);
    if (!section) return NextResponse.json({ error: "Seccion no encontrada" }, { status: 404 });

    const payload = { section };
    writeCache(key, payload, 1000 * 60 * 10);
    return NextResponse.json(payload);
  }

  const key = "discover-movies";
  const cached = readCache(key);
  if (cached) return NextResponse.json(cached);

  const payload = await discoverMoviesPage();
  writeCache(key, payload, 1000 * 60 * 10);
  return NextResponse.json(payload);
}
