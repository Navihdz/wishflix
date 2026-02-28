import { NextResponse } from "next/server";
import { discoverComicsPage } from "@/lib/providers/discover";
import { readCache, writeCache } from "@/lib/cache";

export async function GET() {
  const key = "discover-comics";
  const cached = readCache(key);
  if (cached) return NextResponse.json(cached);

  const payload = await discoverComicsPage();
  writeCache(key, payload, 1000 * 60 * 10);
  return NextResponse.json(payload);
}
