import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { verifyPassword } from "@/lib/auth/password";
import { createSession } from "@/lib/auth/session";

export async function POST(request) {
  try {
    const body = await request.json();
    const email = String(body.email || "").trim().toLowerCase();
    const password = String(body.password || "");

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return NextResponse.json({ error: "Credenciales invalidas" }, { status: 401 });

    const ok = await verifyPassword(password, user.passwordHash);
    if (!ok) return NextResponse.json({ error: "Credenciales invalidas" }, { status: 401 });

    if (!user.activeSpaceId) {
      const membership = await prisma.spaceMember.findFirst({
        where: { userId: user.id },
        select: { spaceId: true },
        orderBy: { id: "asc" }
      });
      if (membership?.spaceId) {
        await prisma.user.update({
          where: { id: user.id },
          data: { activeSpaceId: membership.spaceId }
        });
      }
    }

    await createSession({ userId: user.id, email: user.email, name: user.name });
    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = String(error?.message || "");
    if (message.includes("@prisma/client did not initialize yet")) {
      return NextResponse.json(
        { error: "Prisma no esta inicializado. Ejecuta: npx prisma generate y luego reinicia el servidor." },
        { status: 500 }
      );
    }
    return NextResponse.json({ error: "No se pudo iniciar sesion" }, { status: 500 });
  }
}
