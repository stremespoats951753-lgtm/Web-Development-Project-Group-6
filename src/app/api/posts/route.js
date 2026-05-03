// GET /api/posts?type=update  (all posts, optional type filter)
// POST /api/posts  (create new post)
import { getAllPosts, createPost } from "@/repositories/postRepo";
import { getCurrentUser } from "@/lib/session";
import { json, unauthorized, badRequest } from "@/lib/api";

export async function GET(req) {
  const me = await getCurrentUser();
  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type") || undefined;
  const posts = await getAllPosts(me?.id, 50, type);
  return json({ posts });
}

export async function POST(req) {
  const me = await getCurrentUser();
  if (!me) return unauthorized();
  const { content, type } = await req.json();
  if (!content || !content.trim()) return badRequest("Empty post");
  const allowedTypes = ["update", "achievement", "discussion"];
  const t = allowedTypes.includes(type) ? type : "update";
  const p = await createPost(me.id, content.trim(), t);
  return json({ post: p });
}
