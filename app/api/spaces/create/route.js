import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getSession } from "@/lib/auth/session";
import { generateUniqueJoinCode } from "@/lib/spaces/join-code";

export async function POST(request) {
  const session = await getSession();
  if (!session?.userId) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const body = await request.json().catch(() => ({}));
  const name = String(body.name || "").trim() || "Nuevo equipo";
  const setActive = body.setActive !== false;

  const joinCode = await generateUniqueJoinCode(prisma);
  const space = await prisma.$transaction(async (tx) => {
    const created = await tx.space.create({
      data: { name, joinCode }
    });

    await tx.spaceMember.create({
      data: { userId: session.userId, spaceId: created.id, role: "owner" }
    });

    if (setActive) {
      await tx.user.update({
        where: { id: session.userId },
        data: { activeSpaceId: created.id }
      });
    }

    return created;
  });

  return NextResponse.json({
    ok: true,
    space: { id: space.id, name: space.name, joinCode: space.joinCode }
  });
}

