import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

export const COOKIE_NAME = "scw_session";

function getSecret() {
  const secret = process.env.SESSION_SECRET || "dev-secret-cambiar";
  return new TextEncoder().encode(secret);
}

function getSecureCookieFlag() {
  const forceSecure = process.env.SESSION_COOKIE_SECURE;
  if (forceSecure === "true") return true;
  if (forceSecure === "false") return false;
  return process.env.NODE_ENV === "production";
}

export async function createSession(payload) {
  const token = await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(getSecret());

  const jar = await cookies();
  jar.set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    secure: getSecureCookieFlag(),
    maxAge: 60 * 60 * 24 * 30,
  });
}

export async function clearSession() {
  const jar = await cookies();
  jar.set(COOKIE_NAME, "", { path: "/", maxAge: 0 });
}

export async function getSession() {
  try {
    const jar = await cookies();
    const token = jar.get(COOKIE_NAME)?.value;
    if (!token) return null;
    const { payload } = await jwtVerify(token, getSecret());
    return payload;
  } catch {
    return null;
  }
}
