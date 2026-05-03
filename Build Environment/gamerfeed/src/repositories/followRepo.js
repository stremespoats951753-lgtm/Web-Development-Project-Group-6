// follow repo, follow / unfollow + helper queries
import { prisma } from "@/lib/prisma";

export async function follow(followerId, followingId) {
  if (followerId === followingId) return null; // cant follow yourself
  // upsert ish behavior, ignore if alredy exists
  try {
    return await prisma.follow.create({
      data: { followerId, followingId },
    });
  } catch (e) {
    // duplicate, just return null
    return null;
  }
}

export async function unfollow(followerId, followingId) {
  await prisma.follow.deleteMany({
    where: { followerId, followingId },
  });
  return true;
}

export async function isFollowing(followerId, followingId) {
  const r = await prisma.follow.findUnique({
    where: { followerId_followingId: { followerId, followingId } },
  });
  return !!r;
}

// count helpers used on the profile page
export function countFollowers(userId) {
  return prisma.follow.count({ where: { followingId: userId } });
}
export function countFollowing(userId) {
  return prisma.follow.count({ where: { followerId: userId } });
}
