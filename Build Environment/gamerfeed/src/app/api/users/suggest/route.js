// GET /api/users/suggest, suggests people the current user doesnt follow yet
import { suggestUsersToFollow } from "@/repositories/userRepo";
import { getCurrentUser } from "@/lib/session";
import { json, unauthorized } from "@/lib/api";

export async function GET() {
  const me = await getCurrentUser();
  if (!me) return unauthorized();
  const users = await suggestUsersToFollow(me.id);
  return json({ users });
}
