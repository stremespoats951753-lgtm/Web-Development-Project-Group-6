// POST /api/auth/register
import { createUser, getUserByUsername } from "@/repositories/userRepo";
import { setSession } from "@/lib/session";
import { json, badRequest } from "@/lib/api";

export async function POST(req) {
  const { username, email, password, bio } = await req.json();
  // very basic validation, real apps use zod or yup
  if (!username || !email || !password) return badRequest("Missing fields");
  if (password.length < 6) return badRequest("Password too short");
  const existing = await getUserByUsername(username);
  if (existing) return badRequest("Username already taken");
  const u = await createUser({ username, email, password, bio });
  await setSession(u.id);
  return json({ user: u });
}
