// user repo, all the user related db queries live here
// the spec says do filtering inside the database, so we use prisma where/select
// instead of pulling everything and filtering in JS
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { randomAvatarIcon, lucideUrl } from "@/lib/avatars";

// safe shape we send to the client, no password leak
const PUBLIC_USER = {
  id: true,
  username: true,
  email: true,
  bio: true,
  avatarUrl: true,
  createdAt: true,
};

// register a new user, hashes the password before saving
export async function createUser({ username, email, password, bio }) {
  const hashed = await bcrypt.hash(password, 10);
  // every new user gets a random lucide icon as their avatar URL
  const avatarUrl = lucideUrl(randomAvatarIcon());
  return prisma.user.create({
    data: { username, email, password: hashed, bio: bio || null, avatarUrl },
    select: PUBLIC_USER,
  });
}

// login check, returns user if password matches else null
export async function verifyLogin(username, password) {
  const u = await prisma.user.findUnique({ where: { username } });
  if (!u) return null;
  const ok = await bcrypt.compare(password, u.password);
  if (!ok) return null;
  // strip the hash before returning
  const { password: _ignore, ...rest } = u;
  return rest;
}

export function getUserById(id) {
  return prisma.user.findUnique({ where: { id }, select: PUBLIC_USER });
}

export function getUserByUsername(username) {
  return prisma.user.findUnique({ where: { username }, select: PUBLIC_USER });
}

// update bio / avatar for the loged in user
export function updateUser(id, data) {
  // we only allow these fields to be edited, never password through here
  const allowed = {};
  if (data.bio !== undefined) allowed.bio = data.bio;
  if (data.avatarUrl !== undefined) allowed.avatarUrl = data.avatarUrl;
  if (data.username !== undefined) allowed.username = data.username;
  return prisma.user.update({ where: { id }, data: allowed, select: PUBLIC_USER });
}

// search users by name or username, paginated, done by the database
// using contains so its a partial match (case-insensitive on most dbs)
export function searchUsers(q, limit = 20) {
  if (!q) return Promise.resolve([]);
  return prisma.user.findMany({
    where: {
      OR: [
        { username: { contains: q } },
        { bio:      { contains: q } },
      ],
    },
    select: PUBLIC_USER,
    take: limit,
  });
}

// suggested users to follow: users not already followed by the current one
// we ask sqlite to do the NOT IN logic, no full table fetch in js
export async function suggestUsersToFollow(currentUserId, limit = 5) {
  const following = await prisma.follow.findMany({
    where: { followerId: currentUserId },
    select: { followingId: true },
  });
  const excludeIds = following.map((f) => f.followingId);
  excludeIds.push(currentUserId); // dont sugest yourself

  return prisma.user.findMany({
    where: { id: { notIn: excludeIds } },
    select: PUBLIC_USER,
    take: limit,
    orderBy: { createdAt: "desc" },
  });
}
