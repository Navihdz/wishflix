import { NextResponse } from "next/server";
import { discoverHome, discoverHomeSectionPage } from "@/lib/providers/discover";
import prisma from "@/lib/db";
import { getSession } from "@/lib/auth/session";
import { readCache, writeCache } from "@/lib/cache";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const sectionId = String(searchParams.get("section") || "").trim();
  const pageParam = Number(searchParams.get("page") || "1");

  if (sectionId) {
    const page = Number.isFinite(pageParam) && pageParam > 0 ? Math.floor(pageParam) : 1;
    const key = `discover-home:${sectionId}:${page}`;
    const cachedSection = readCache(key);
    if (cachedSection) return NextResponse.json(cachedSection);

    const section = await discoverHomeSectionPage(sectionId, page);
    if (!section) return NextResponse.json({ error: "Seccion no encontrada" }, { status: 404 });

    const payload = { section };
    writeCache(key, payload, 1000 * 60 * 10);
    return NextResponse.json(payload);
  }

  const session = await getSession();
  const userId = typeof session?.userId === "string" ? session.userId : "";

  let lastVisitedAt = null;
  if (userId) {
    try {
      const rows = await prisma.$queryRaw`
        SELECT "lastHomeVisitedAt"
        FROM "User"
        WHERE "id" = ${userId}
        LIMIT 1
      `;
      const rawValue = rows?.[0]?.lastHomeVisitedAt ?? null;
      lastVisitedAt = rawValue ? new Date(rawValue) : null;
    } catch {
      lastVisitedAt = null;
    }
  }

  const payload = await discoverHome({ lastVisitedAt });

  if (userId) {
    try {
      await prisma.$executeRaw`
        UPDATE "User"
        SET "lastHomeVisitedAt" = ${new Date().toISOString()}
        WHERE "id" = ${userId}
      `;
    } catch {
      // Column may not exist yet if migration hasn't been applied.
    }
  }

  return NextResponse.json(payload);
}
