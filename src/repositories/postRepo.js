// post repo, queries for posts/comments/likes
// keeps thin api routes, all the prisma stuff happens here
import { prisma } from "@/lib/prisma";

// shape we always include for a post, has author + counts + my-like flag
function postInclude(currentUserId) {
  return {
    author: {
      select: { id: true, username: true, avatarUrl: true },
    },
    _count: { select: { likes: true, comments: true } },
    // tells us if the loged in user already liked this post
    // the where filter happens in the database, no js side filtering
    likes: currentUserId
      ? { where: { userId: currentUserId }, select: { id: true } }
      : false,
  };
}

// flatten the prisma row into something easier to use in react
function shapePost(p) {
  return {
    id: p.id,
    content: p.content,
    type: p.type,
    createdAt: p.createdAt,
    author: p.author,
    likeCount: p._count.likes,
    commentCount: p._count.comments,
    likedByMe: Array.isArray(p.likes) ? p.likes.length > 0 : false,
  };
}

// the main news feed: posts from people I follow, sorted newest first
// note: the followingIds list is built by the database, we never load all posts
export async function getFollowingFeed(currentUserId, take = 50, type) {
  const follows = await prisma.follow.findMany({
    where: { followerId: currentUserId },
    select: { followingId: true },
  });
  const ids = follows.map((f) => f.followingId);
  // include my own posts too so the feed isnt empty when no follows yet
  ids.push(currentUserId);

  const rows = await prisma.post.findMany({
    where: {
      authorId: { in: ids },
      ...(type ? { type } : {}),
    },
    include: postInclude(currentUserId),
    orderBy: { createdAt: "desc" },
    take,
  });
  return rows.map(shapePost);
}

// global feed (explore-ish), used by the explore page
export async function getAllPosts(currentUserId, take = 50, type) {
  return (
    await prisma.post.findMany({
      where: type ? { type } : {},
      include: postInclude(currentUserId),
      orderBy: { createdAt: "desc" },
      take,
    })
  ).map(shapePost);
}

// posts written by one user, used on profile page
export async function getPostsByUser(userId, currentUserId) {
  return (
    await prisma.post.findMany({
      where: { authorId: userId },
      include: postInclude(currentUserId),
      orderBy: { createdAt: "desc" },
    })
  ).map(shapePost);
}

export async function getPostById(id, currentUserId) {
  const p = await prisma.post.findUnique({
    where: { id },
    include: postInclude(currentUserId),
  });
  return p ? shapePost(p) : null;
}

export function createPost(authorId, content, type = "update") {
  return prisma.post.create({
    data: { authorId, content, type },
  });
}

// only the author can delete, we check ownership in the db query
export async function deletePost(postId, currentUserId) {
  const p = await prisma.post.findUnique({ where: { id: postId } });
  if (!p || p.authorId !== currentUserId) return false;
  await prisma.post.delete({ where: { id: postId } });
  return true;
}

// ------- comments -------

export function getCommentsForPost(postId) {
  return prisma.comment.findMany({
    where: { postId },
    orderBy: { createdAt: "asc" },
    include: { author: { select: { id: true, username: true, avatarUrl: true } } },
  });
}

export function addComment(postId, authorId, content) {
  return prisma.comment.create({ data: { postId, authorId, content } });
}

export async function deleteComment(commentId, currentUserId) {
  const c = await prisma.comment.findUnique({ where: { id: commentId } });
  if (!c || c.authorId !== currentUserId) return false;
  await prisma.comment.delete({ where: { id: commentId } });
  return true;
}

// ------- likes -------

// toggles like and returns the new like count
// we use the @@unique([userId,postId]) constraint to prevent duplicates
export async function toggleLike(postId, userId) {
  const existing = await prisma.like.findUnique({
    where: { userId_postId: { userId, postId } },
  });
  if (existing) {
    await prisma.like.delete({ where: { id: existing.id } });
  } else {
    await prisma.like.create({ data: { postId, userId } });
  }
  // ask the db for the fresh count, dont keep a stale js counter
  const count = await prisma.like.count({ where: { postId } });
  return { liked: !existing, count };
}
