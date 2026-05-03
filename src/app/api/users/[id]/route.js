// GET /api/users/[id] - returns user + follower/following counts + isFollowing flag
import { getUserById } from "@/repositories/userRepo";
import { countFollowers, countFollowing, isFollowing } from "@/repositories/followRepo";
import { getCurrentUser } from "@/lib/session";
import { json, notFound } from "@/lib/api";

export async function GET(_req, { params }) {
  const { id } = await params;
  // bug fix: prisma user.id is an Int, passing the raw string "5" makes
  // findUnique blow up silently and the profile page hangs on "Loading..."
  const nid = Number(id);
  const user = await getUserById(nid);
  if (!user) return notFound();
  const me = await getCurrentUser();
  const [followers, following, follows] = await Promise.all([
    countFollowers(nid),
    countFollowing(nid),
    me ? isFollowing(me.id, nid) : false,
  ]);
  return json({ user, followers, following, isFollowing: !!follows, isMe: me?.id === nid });
}
