// POST /api/auth/login
import { verifyLogin } from "@/repositories/userRepo";
import { setSession } from "@/lib/session";
import { json, badRequest, unauthorized } from "@/lib/api";

export async function POST(req) {
  const { username, password } = await req.json();
  if (!username || !password) return badRequest("Missing fields");
  const user = await verifyLogin(username, password);
  if (!user) return unauthorized("Wrong username or password");
  await setSession(user.id);
  return json({ user });
}
