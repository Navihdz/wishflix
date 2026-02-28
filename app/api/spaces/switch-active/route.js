import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getSession } from "@/lib/auth/session";

export async function POST(request) {
  const session = await getSession();
  if (!session?.userId) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const body = await request.json().catch(() => ({}));
  const spaceId = String(body.spaceId || "").trim();
  if (!spaceId) return NextResponse.json({ error: "spaceId requerido" }, { status: 400 });

  const membership = await prisma.spaceMember.findFirst({
    where: { userId: session.userId, spaceId },
    select: { id: true }
  });
  if (!membership) return NextResponse.json({ error: "No perteneces a ese equipo" }, { status: 403 });

  await prisma.user.update({
    where: { id: session.userId },
    data: { activeSpaceId: spaceId }
  });

  return NextResponse.json({ ok: true });
}

