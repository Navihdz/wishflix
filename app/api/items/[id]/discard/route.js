import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getCurrentUserContext } from "@/lib/auth/current-user";

export async function PATCH(_request, { params }) {
  const ctx = await getCurrentUserContext();
  if (!ctx) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const updated = await prisma.item.updateMany({
    where: { id: params.id, spaceId: ctx.space.id },
    data: { status: "discarded" }
  });

  if (!updated.count) return NextResponse.json({ error: "Item no encontrado" }, { status: 404 });
  return NextResponse.json({ ok: true });
}
