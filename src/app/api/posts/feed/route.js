// GET /api/posts/feed  - the FOLLOWING feed, only people I follow + me
import { getFollowingFeed } from "@/repositories/postRepo";
import { getCurrentUser } from "@/lib/session";
import { json, unauthorized } from "@/lib/api";

export async function GET(req) {
  const me = await getCurrentUser();
  if (!me) return unauthorized();

  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type") || undefined;

  const posts = await getFollowingFeed(me.id, 50, type);
  return json({ posts });
}
