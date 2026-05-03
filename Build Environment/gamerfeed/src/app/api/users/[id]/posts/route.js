// GET /api/users/[id]/posts - all posts by that user
import { getPostsByUser } from "@/repositories/postRepo";
import { getCurrentUser } from "@/lib/session";
import { json } from "@/lib/api";

export async function GET(_req, { params }) {
  const { id } = await params;
  const me = await getCurrentUser();
  const posts = await getPostsByUser(Number(id), me?.id);
  return json({ posts });
}
