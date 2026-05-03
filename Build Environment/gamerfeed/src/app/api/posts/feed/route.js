// GET /api/posts/feed  - the FOLLOWING feed, only people I follow + me
import { getFollowingFeed } from "@/repositories/postRepo";
import { getCurrentUser } from "@/lib/session";
import { json, unauthorized } from "@/lib/api";

export async function GET() {
  const me = await getCurrentUser();
  if (!me) return unauthorized();
  const posts = await getFollowingFeed(me.id);
  return json({ posts });
}
