// POST /api/posts/[id]/like  - toggles like, returns the FRESH count from db
import { toggleLike } from "@/repositories/postRepo";
import { getCurrentUser } from "@/lib/session";
import { json, unauthorized } from "@/lib/api";

export async function POST(_req, { params }) {
  const { id } = await params;
  const me = await getCurrentUser();
  if (!me) return unauthorized();
  const result = await toggleLike(Number(id), me.id);
  return json(result);
}
