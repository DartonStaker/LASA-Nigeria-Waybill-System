import { cookies } from "next/headers";

import type { SessionUser } from "./users";
import {
  createSessionToken,
  SESSION_COOKIE_NAME,
  SESSION_TTL,
  verifySessionToken,
} from "./token";

export { SESSION_COOKIE_NAME, createSessionToken, verifySessionToken };

export async function getSessionUserFromCookies(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!token) {
    return null;
  }

  try {
    const payload = await verifySessionToken(token);
    return {
      id: payload.sub,
      username: payload.username,
      displayName: payload.displayName,
    };
  } catch (error) {
    console.warn("[auth] Invalid session token", error);
    return null;
  }
}

export async function setSessionCookie(token: string) {
  const cookieStore = await cookies();
  cookieStore.set({
    name: SESSION_COOKIE_NAME,
    value: token,
    httpOnly: true,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: SESSION_TTL,
  });
}

export async function clearSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}

