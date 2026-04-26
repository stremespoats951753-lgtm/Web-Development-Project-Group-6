// lib/repository.js – GamerFeed Data Repository
// All DB reads/writes go here. Filtering, sorting, aggregation done in DB.

const { prisma } = require('./prisma');

// ── POSTS ────────────────────────────────────────────────────

/**
 * Get all posts (optionally filtered by type), newest first.
 * Returns author info + aggregated like/comment counts.
 */
async function getPosts({ type } = {}) {
  return prisma.post.findMany({
    where: type && type !== 'all' ? { type } : undefined,
    orderBy: { createdAt: 'desc' },
    include: {
      author: { select: { id: true, username: true, avatarText: true, avatarColor: true } },
      _count: { select: { likes: true, comments: true } },
    },
  });
}

/**
 * Get a single post by id with full detail (author, comments, likes).
 */
async function getPostById(id) {
  return prisma.post.findUnique({
    where: { id: Number(id) },
    include: {
      author: { select: { id: true, username: true, avatarText: true, avatarColor: true } },
      _count: { select: { likes: true } },
      comments: {
        orderBy: { createdAt: 'asc' },
        include: {
          author: { select: { id: true, username: true, avatarText: true, avatarColor: true } },
          _count: { select: { likes: true } },
        },
      },
    },
  });
}

/**
 * Create a new post. Returns the created post with author.
 */
async function createPost({ authorId, type, title, content, game, hasAchievement, achievementName }) {
  return prisma.post.create({
    data: {
      authorId: Number(authorId),
      type,
      title,
      content,
      game: game || 'General',
      hasAchievement: Boolean(hasAchievement),
      achievementName: hasAchievement ? achievementName : null,
    },
    include: {
      author: { select: { id: true, username: true, avatarText: true, avatarColor: true } },
      _count: { select: { likes: true, comments: true } },
    },
  });
}

/**
 * Delete a post (cascades to comments and likes).
 */
async function deletePost(id) {
  return prisma.post.delete({ where: { id: Number(id) } });
}

// ── LIKES ────────────────────────────────────────────────────

/**
 * Toggle like on a post for a given user.
 * Returns { liked: boolean, likeCount: number }
 */
async function togglePostLike(postId, userId) {
  postId = Number(postId);
  userId = Number(userId);

  const existing = await prisma.like.findUnique({
    where: { userId_postId: { userId, postId } },
  });

  if (existing) {
    await prisma.like.delete({ where: { id: existing.id } });
  } else {
    await prisma.like.create({ data: { userId, postId } });
  }

  const likeCount = await prisma.like.count({ where: { postId } });
  return { liked: !existing, likeCount };
}

/**
 * Check which posts (from a list of ids) the user has liked.
 * Returns a Set of postIds.
 */
async function getUserPostLikes(userId, postIds) {
  if (!userId || postIds.length === 0) return new Set();
  const likes = await prisma.like.findMany({
    where: { userId: Number(userId), postId: { in: postIds.map(Number) } },
    select: { postId: true },
  });
  return new Set(likes.map(l => l.postId));
}

// ── COMMENTS ─────────────────────────────────────────────────

/**
 * Add a comment to a post.
 */
async function createComment({ postId, authorId, text }) {
  return prisma.comment.create({
    data: {
      postId: Number(postId),
      authorId: Number(authorId),
      text,
    },
    include: {
      author: { select: { id: true, username: true, avatarText: true, avatarColor: true } },
      _count: { select: { likes: true } },
    },
  });
}

/**
 * Get all comments for a post (newest first).
 */
async function getCommentsByPost(postId) {
  return prisma.comment.findMany({
    where: { postId: Number(postId) },
    orderBy: { createdAt: 'asc' },
    include: {
      author: { select: { id: true, username: true, avatarText: true, avatarColor: true } },
      _count: { select: { likes: true } },
    },
  });
}

// ── USERS ────────────────────────────────────────────────────

/**
 * Get all users ordered by XP descending (leaderboard).
 */
async function getLeaderboard(limit = 10) {
  return prisma.user.findMany({
    orderBy: { xp: 'desc' },
    take: limit,
    select: { id: true, username: true, displayName: true, avatarText: true, avatarColor: true, xp: true },
  });
}

/**
 * Get a user by id.
 */
async function getUserById(id) {
  return prisma.user.findUnique({
    where: { id: Number(id) },
    include: {
      _count: { select: { posts: true, comments: true, likes: true } },
    },
  });
}

/**
 * Get the "current" logged-in user. In this demo we always use id=1 (DrMucahid).
 */
async function getCurrentUser() {
  return prisma.user.findUnique({
    where: { id: 1 },
    select: { id: true, username: true, displayName: true, avatarText: true, avatarColor: true, xp: true },
  });
}

module.exports = {
  getPosts,
  getPostById,
  createPost,
  deletePost,
  togglePostLike,
  getUserPostLikes,
  createComment,
  getCommentsByPost,
  getLeaderboard,
  getUserById,
  getCurrentUser,
};
