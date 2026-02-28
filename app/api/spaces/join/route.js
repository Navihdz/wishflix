import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getSession } from "@/lib/auth/session";
import { mergeSpaceIntoTarget } from "@/lib/spaces/merge";

export async function POST(request) {
  const session = await getSession();
  if (!session?.userId) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const body = await request.json().catch(() => ({}));
  const joinCode = String(body.joinCode || "").trim().toUpperCase();
  const mergeFromActive = Boolean(body.mergeFromActive);

  if (!joinCode) return NextResponse.json({ error: "Codigo requerido" }, { status: 400 });

  const targetSpace = await prisma.space.findUnique({
    where: { joinCode },
    select: { id: true, name: true, joinCode: true }
  });
  if (!targetSpace) return NextResponse.json({ error: "Codigo invalido" }, { status: 404 });

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { activeSpaceId: true }
  });
  if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const result = await prisma.$transaction(async (tx) => {
    await tx.spaceMember.upsert({
      where: { spaceId_userId: { spaceId: targetSpace.id, userId: session.userId } },
      update: {},
      create: { userId: session.userId, spaceId: targetSpace.id, role: "member" }
    });

    let mergeSummary = { created: 0, merged: 0 };
    if (mergeFromActive && user.activeSpaceId && user.activeSpaceId !== targetSpace.id) {
      mergeSummary = await mergeSpaceIntoTarget({
        prisma: tx,
        sourceSpaceId: user.activeSpaceId,
        targetSpaceId: targetSpace.id
      });
    }

    await tx.user.update({
      where: { id: session.userId },
      data: { activeSpaceId: targetSpace.id }
    });

    return mergeSummary;
  });

  return NextResponse.json({ ok: true, space: targetSpace, merge: result });
}
