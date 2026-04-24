// app/api/auth/session/route.js

import { prisma } from "../../../../prisma/prisma.js";

function parseCookies(request) {
  const cookieHeader = request.headers.get("cookie") ?? "";
  const cookies = {};
  for (const part of cookieHeader.split(";")) {
    const eqIdx = part.indexOf("=");
    if (eqIdx === -1) continue;
    const key = part.slice(0, eqIdx).trim();
    const val = part.slice(eqIdx + 1).trim();
    if (key) cookies[key] = decodeURIComponent(val);
  }
  return cookies;
}

function json(status, data) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

export async function GET(request) {
  try {
    const cookies = parseCookies(request);
    const raw = cookies["session"];

    if (!raw) {
      return json(200, { authenticated: false, user: null });
    }

    let session;
    try {
      session = JSON.parse(raw);
    } catch {
      return json(200, { authenticated: false, user: null });
    }

    if (!session?.userId) {
      return json(200, { authenticated: false, user: null });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: {
        id:             true,
        username:       true,
        email:          true,
        firstName:      true,
        lastName:       true,
        bio:            true,
        profilePicture: true,
      },
    });

    if (!user) {
      return json(200, { authenticated: false, user: null });
    }

    return json(200, { authenticated: true, user });
  } catch (err) {
    console.error("[session]", err);
    return json(200, { authenticated: false, user: null });
  }
}