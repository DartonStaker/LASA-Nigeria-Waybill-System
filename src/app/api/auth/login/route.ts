import { NextResponse } from "next/server";

import {
  createSessionToken,
  setSessionCookie,
} from "@/lib/auth/session";
import { verifyUserCredentials } from "@/lib/auth/users";

type LoginRequestBody = {
  username?: string;
  password?: string;
};

export async function POST(request: Request) {
  const body = (await request.json()) as LoginRequestBody;
  const username = body.username?.trim();
  const password = body.password;

  if (!username || !password) {
    return NextResponse.json(
      { error: "Username and password are required." },
      { status: 400 },
    );
  }

  const sessionUser = verifyUserCredentials(username, password);

  if (!sessionUser) {
    return NextResponse.json(
      { error: "Invalid credentials." },
      { status: 401 },
    );
  }

  const token = await createSessionToken(sessionUser);
  await setSessionCookie(token);

  return NextResponse.json({
    success: true,
    user: sessionUser,
  });
}

