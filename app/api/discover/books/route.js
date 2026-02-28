import { NextResponse } from "next/server";
import { discoverBooksPage } from "@/lib/providers/discover";
import { readCache, writeCache } from "@/lib/cache";

export async function GET() {
  const key = "discover-books";
  const cached = readCache(key);
  if (cached) return NextResponse.json(cached);

  const payload = await discoverBooksPage();
  writeCache(key, payload, 1000 * 60 * 10);
  return NextResponse.json(payload);
}
