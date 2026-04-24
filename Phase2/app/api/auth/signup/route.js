// app/api/auth/signup/route.js

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
    const { username, email, password, firstName, lastName, bio, profilePicture } =
      await request.json();

    if (!username || !email || !password || !firstName || !lastName) {
      return json(400, {
        success: false,
        error: "username, email, password, firstName and lastName are required",
      });
    }

    const existing = await prisma.user.findFirst({
      where: { OR: [{ email }, { username }] },
    });

    if (existing) {
      const field = existing.email === email ? "email" : "username";
      return json(409, { success: false, error: `That ${field} is already taken` });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        username,
        email,
        passwordHash,
        firstName,
        lastName,
        bio: bio ?? null,
        profilePicture: profilePicture ?? null,
      },
      select: {
        id: true,
        username: true,
        email: true,
        firstName: true,
        lastName: true,
        bio: true,
        profilePicture: true,
        createdAt: true,
      },
    });

    const cookie = buildCookie({ userId: user.id, username: user.username, email: user.email });

    return json(201, { success: true, user }, cookie);
  } catch (err) {
    console.error("[signup]", err);
    return json(500, { success: false, error: "Internal server error" });
  }
}