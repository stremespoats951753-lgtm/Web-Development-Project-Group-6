// PATCH /api/users/me - edit own bio / username
import { updateUser } from "@/repositories/userRepo";
import { getCurrentUser } from "@/lib/session";
import { json, unauthorized } from "@/lib/api";

export async function PATCH(req) {
  const me = await getCurrentUser();
  if (!me) return unauthorized();
  const data = await req.json();
  const u = await updateUser(me.id, data);
  return json({ user: u });
}
