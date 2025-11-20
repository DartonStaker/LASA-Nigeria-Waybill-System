import type { JWTPayload } from "jose";
import { jwtVerify, SignJWT } from "jose";

import type { SessionUser } from "./users";

const AUTH_SECRET = process.env.AUTH_SECRET || "dev-lasa-waybill-secret";
const SESSION_TTL_SECONDS = Number(process.env.AUTH_SESSION_TTL ?? 60 * 60 * 8);

export const SESSION_COOKIE_NAME =
  process.env.AUTH_COOKIE_NAME || "lasa_waybill_session";

const secretKey = new TextEncoder().encode(AUTH_SECRET);

export async function createSessionToken(user: SessionUser) {
  return new SignJWT({
    sub: user.id,
    username: user.username,
    displayName: user.displayName,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_TTL_SECONDS}s`)
    .sign(secretKey);
}

export type SessionPayload = JWTPayload & {
  sub: string;
  username: string;
  displayName: string;
};

export async function verifySessionToken(
  token: string,
): Promise<SessionPayload> {
  const { payload } = await jwtVerify(token, secretKey);

  if (
    !payload.sub ||
    typeof payload.username !== "string" ||
    typeof payload.displayName !== "string"
  ) {
    throw new Error("Invalid session payload");
  }

  return payload as SessionPayload;
}

export const SESSION_TTL = SESSION_TTL_SECONDS;

