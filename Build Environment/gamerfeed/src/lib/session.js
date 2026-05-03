// helpers for the very simple session, we just store user id in a cookie
// not super secure but the spec says simple login is fine for the course
// ref: https://nextjs.org/docs/app/api-reference/functions/cookies
import { cookies } from "next/headers";
import { prisma } from "./prisma";

const COOKIE_NAME = "gf_uid";

// reads the cookie and looks up the user, returns null if not loged in
export async function getCurrentUser() {
  const cookieStore = await cookies();

  const c = cookieStore.get(COOKIE_NAME);
  if (!c) return null;

  const id = parseInt(c.value, 10);
  if (Number.isNaN(id)) return null;

  const u = await prisma.user.findUnique({ where: { id } });
  return u;
}

// sets the session cookie after login/register
export async function setSession(userId) {
    const cookieStore = await cookies();    

  cookieStore.set(COOKIE_NAME, String(userId), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    // 7 days, plenty for a school project
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function clearSession() { 
  const cookieStore = await cookies(); 
  cookieStore.delete(COOKIE_NAME);
}