// app/api/auth/login/route.js

import bcrypt from "bcryptjs";
import { prisma } from "../../../../prisma/prisma.js";
const IS_PROD = process.env.NODE_ENV === "production";
const SESSION_MAX_AGE = 7 * 24 * 60 * 60;

function buildCookie(value) {
  const encoded = encodeURIComponent(JSON.stringify(value));
  let cookie = `session=${encoded}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${SESSION_MAX_AGE}`;
  if (IS_PROD) cookie += "; Secure";
  return cookie;
}

function json(status, data, setCookie = null) {
  const headers = new Headers({ "Content-Type": "application/json" });
  if (setCookie) headers.set("Set-Cookie", setCookie);
  return new Response(JSON.stringify(data), { status, headers });
}

export async function POST(request) {
  try {
    const { identifier, password } = await request.json();

    if (!identifier || !password) {
      return json(400, { success: false, error: "identifier and password are required" });
    }

    const user = await prisma.user.findFirst({
      where: { OR: [{ email: identifier }, { username: identifier }] },
    });

    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      return json(401, { success: false, error: "Invalid credentials" });
    }

    const cookie = buildCookie({ userId: user.id, username: user.username, email: user.email });

    return json(
      200,
      {
        success: true,
        user: {
          id:             user.id,
          username:       user.username,
          email:          user.email,
          firstName:      user.firstName,
          lastName:       user.lastName,
          bio:            user.bio,
          profilePicture: user.profilePicture,
        },
      },
      cookie
    );
  } catch (err) {
    console.error("[login]", err);
    return json(500, { success: false, error: "Internal server error" });
  }
}