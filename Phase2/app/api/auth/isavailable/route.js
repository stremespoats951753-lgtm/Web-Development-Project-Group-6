import { prisma } from "../../../../prisma/prisma.js";
// app/api/auth/isavailable/route.js

function json(status, data) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

// GET /api/auth/isavailable?username=foo
// GET /api/auth/isavailable?email=foo@bar.com
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const username = searchParams.get("username");
    const email = searchParams.get("email");

    if (!username && !email) {
      return json(400, { success: false, error: "Provide a username or email query param" });
    }

    const where = [];
    if (username) where.push({ username });
    if (email) where.push({ email });

    const existing = await prisma.user.findFirst({ where: { OR: where } });

    return json(200, { available: !existing });
  } catch (err) {
    console.error("[isavailable]", err);
    return json(500, { success: false, error: "Internal server error" });
  }
}