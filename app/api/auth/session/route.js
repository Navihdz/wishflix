import { NextResponse } from "next/server";
import { getCurrentUserContext } from "@/lib/auth/current-user";

export async function GET() {
  const ctx = await getCurrentUserContext();
  if (!ctx) return NextResponse.json({ authenticated: false });
  return NextResponse.json({ authenticated: true, user: ctx.user, space: ctx.space });
}

