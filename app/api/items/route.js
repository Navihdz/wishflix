import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { itemSchema } from "@/lib/validation/item";
import { getCurrentUserContext } from "@/lib/auth/current-user";

export async function GET(request) {
  const ctx = await getCurrentUserContext();
  if (!ctx) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type");
  const status = searchParams.get("status") || "wishlist";

  const items = await prisma.item.findMany({
    where: {
      spaceId: ctx.space.id,
      ...(type ? { type } : {}),
      ...(status ? { status } : {})
    },
    include: {
      addedBy: { select: { name: true } },
      completedBy: { select: { name: true } },
      contributors: { include: { user: { select: { id: true, name: true } } } }
    },
    orderBy: { addedAt: "desc" }
  });

  return NextResponse.json({ items });
}

export async function POST(request) {
  const ctx = await getCurrentUserContext();
  if (!ctx) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const payload = await request.json();
  const parsed = itemSchema.safeParse(payload);
  if (!parsed.success) return NextResponse.json({ error: "Payload inválido" }, { status: 400 });

  try {
    const item = await prisma.item.create({
      data: {
        title: parsed.data.title,
        posterImage: parsed.data.poster_image || null,
        type: parsed.data.type,
        source: parsed.data.source,
        externalId: parsed.data.external_id,
        notes: parsed.data.notes || null,
        spaceId: ctx.space.id,
        addedById: ctx.user.id,
        contributors: { create: [{ userId: ctx.user.id }] }
      },
      include: {
        contributors: { include: { user: { select: { id: true, name: true } } } }
      }
    });
    return NextResponse.json({ item });
  } catch (error) {
    if (String(error.message || "").includes("Unique constraint")) {
      const existing = await prisma.item.findFirst({
        where: {
          spaceId: ctx.space.id,
          type: parsed.data.type,
          source: parsed.data.source,
          externalId: parsed.data.external_id
        },
        select: { id: true, status: true }
      });

      if (!existing) return NextResponse.json({ error: "Ya en wishlist" }, { status: 409 });

      if (existing.status === "wishlist") {
        return NextResponse.json({ error: "Ya en wishlist" }, { status: 409 });
      }

      const restored = await prisma.item.update({
        where: { id: existing.id },
        data: {
          status: "wishlist",
          completedById: null,
          completedAt: null,
          notes: parsed.data.notes || undefined,
          posterImage: parsed.data.poster_image || undefined,
          contributors: {
            upsert: {
              where: {
                itemId_userId: {
                  itemId: existing.id,
                  userId: ctx.user.id
                }
              },
              update: {},
              create: { userId: ctx.user.id }
            }
          }
        },
        include: {
          addedBy: { select: { name: true } },
          completedBy: { select: { name: true } },
          contributors: { include: { user: { select: { id: true, name: true } } } }
        }
      });

      return NextResponse.json({ item: restored, restored: true });
    }
    return NextResponse.json({ error: "No se pudo guardar" }, { status: 500 });
  }
}
