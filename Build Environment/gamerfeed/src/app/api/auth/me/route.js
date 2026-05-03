// GET /api/auth/me, returns current user or null
import { getCurrentUser } from "@/lib/session";
import { json } from "@/lib/api";

export async function GET() {
  const u = await getCurrentUser();
  if (!u) return json({ user: null });
  // strip the password hash before sending
  const { password, ...rest } = u;
  return json({ user: rest });
}
