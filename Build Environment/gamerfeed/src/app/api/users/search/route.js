// GET /api/users/search?q=...
import { searchUsers } from "@/repositories/userRepo";
import { json } from "@/lib/api";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const q = (searchParams.get("q") || "").trim();
  const users = await searchUsers(q);
  return json({ users });
}
