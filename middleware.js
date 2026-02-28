import { NextResponse } from "next/server";
import { COOKIE_NAME } from "@/lib/auth/session";

const publicRoutes = ["/login", "/api/auth/login", "/api/auth/register", "/api/auth/session", "/manifest.webmanifest"];

export function middleware(request) {
  const { pathname } = request.nextUrl;
  if (pathname.startsWith("/_next") || pathname.startsWith("/favicon")) return NextResponse.next();
  if (publicRoutes.some((route) => pathname.startsWith(route))) return NextResponse.next();

  const token = request.cookies.get(COOKIE_NAME)?.value;
  if (!token) {
    const loginUrl = new URL("/login", request.url);
    return NextResponse.redirect(loginUrl);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api/auth/logout).*)"]
};
