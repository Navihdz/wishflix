import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getSession } from "@/lib/auth/session";

export async function GET() {
  const session = await getSession();
  if (!session?.userId) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: {
      id: true,
      activeSpaceId: true,
      memberships: {
        include: { space: { select: { id: true, name: true, joinCode: true } } }
      }
    }
  });

  if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const spaces = user.memberships.map((membership) => membership.space);
  return NextResponse.json({
    spaces,
    activeSpaceId: user.activeSpaceId || spaces[0]?.id || null
  });
}

