import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { hashPassword } from "@/lib/auth/password";
import { createSession } from "@/lib/auth/session";
import { generateUniqueJoinCode } from "@/lib/spaces/join-code";

function sanitizeEmail(value) {
  return String(value || "").trim().toLowerCase();
}

export async function POST(request) {
  try {
    const body = await request.json();
    const name = String(body.name || "").trim();
    const email = sanitizeEmail(body.email);
    const password = String(body.password || "");

    if (!name || !email || password.length < 8) {
      return NextResponse.json({ error: "Datos invalidos" }, { status: 400 });
    }

    const existing = await prisma.user.findUnique({ where: { email }, select: { id: true } });
    if (existing) {
      return NextResponse.json({ error: "Email ya registrado" }, { status: 409 });
    }

    const passwordHash = await hashPassword(password);
    const joinCode = await generateUniqueJoinCode(prisma);

    const user = await prisma.$transaction(async (tx) => {
      const createdUser = await tx.user.create({
        data: { name, email, passwordHash }
      });

      const personalSpace = await tx.space.create({
        data: {
          name: `Espacio de ${name}`,
          joinCode
        }
      });

      await tx.spaceMember.create({
        data: { userId: createdUser.id, spaceId: personalSpace.id, role: "owner" }
      });

      return tx.user.update({
        where: { id: createdUser.id },
        data: { activeSpaceId: personalSpace.id },
        select: { id: true, email: true, name: true }
      });
    });

    await createSession({ userId: user.id, email: user.email, name: user.name });
    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = String(error?.message || "");
    if (message.includes("Unknown argument `joinCode`") || message.includes("Unknown argument `activeSpaceId`")) {
      return NextResponse.json(
        { error: "Falta sincronizar Prisma. Ejecuta: npx prisma generate y npx prisma migrate deploy." },
        { status: 500 }
      );
    }
    return NextResponse.json({ error: "No se pudo crear la cuenta" }, { status: 500 });
  }
}
