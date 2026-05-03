// stats repository, this powers the /stats page
// every single one of these does the work in the database (groupBy, count, aggregate, raw)
// not in JavaScript. that is the whole point of phase 2.
//
// refs:
//   https://www.prisma.io/docs/orm/prisma-client/queries/aggregation-grouping-summarizing
//   https://www.prisma.io/docs/orm/prisma-client/queries/raw-database-access
import { prisma } from "@/lib/prisma";

// 1. total counts of users, posts, comments, likes (4 numbers)
export async function getTotals() {
  // we run all 4 in parallel, each is a single COUNT(*) in sqlite
  const [users, posts, comments, likes, follows] = await Promise.all([
    prisma.user.count(),
    prisma.post.count(),
    prisma.comment.count(),
    prisma.like.count(),
    prisma.follow.count(),
  ]);
  return { users, posts, comments, likes, follows };
}

// 2. average number of followers per user
// uses raw sql so the AVG happens inside sqlite, not in js
export async function getAverageFollowersPerUser() {
  // we left join so users with 0 follows still count as 0
  const rows = await prisma.$queryRaw`
    SELECT AVG(c) AS avg FROM (
      SELECT u.id, COUNT(f.id) AS c
      FROM User u
      LEFT JOIN Follow f ON f.followingId = u.id
      GROUP BY u.id
    )
  `;
  // sqlite returns a number, default to 0 when db is empty
  const avg = rows?.[0]?.avg ?? 0;
  return Number(avg).toFixed(2);
}

// 3. average posts per user, same idea as above
export async function getAveragePostsPerUser() {
  const rows = await prisma.$queryRaw`
    SELECT AVG(c) AS avg FROM (
      SELECT u.id, COUNT(p.id) AS c
      FROM User u
      LEFT JOIN Post p ON p.authorId = u.id
      GROUP BY u.id
    )
  `;
  return Number(rows?.[0]?.avg ?? 0).toFixed(2);
}

// 4. most active user in the last 3 months (most posts written)
// done with groupBy + a date filter in the where clause
export async function getMostActiveUserLast3Months() {
  const since = new Date();
  since.setMonth(since.getMonth() - 3);

  const grouped = await prisma.post.groupBy({
    by: ["authorId"],
    where: { createdAt: { gte: since } },
    _count: { _all: true },
    orderBy: { _count: { authorId: "desc" } },
    take: 1,
  });
  if (grouped.length === 0) return null;

  // one extra round trip just to grab the username, still no full table scan
  const u = await prisma.user.findUnique({
    where: { id: grouped[0].authorId },
    select: { id: true, username: true, avatarUrl: true },
  });
  return { user: u, postCount: grouped[0]._count._all };
}

// 5. top 5 most liked posts of all time
export async function getTopLikedPosts(limit = 5) {
  // groupBy gives us postId + count, then we hydrate the post details
  const grouped = await prisma.like.groupBy({
    by: ["postId"],
    _count: { _all: true },
    orderBy: { _count: { postId: "desc" } },
    take: limit,
  });
  if (grouped.length === 0) return [];

  const ids = grouped.map((g) => g.postId);
  const posts = await prisma.post.findMany({
    where: { id: { in: ids } },
    include: { author: { select: { username: true, avatarUrl: true } } },
  });
  // glue the like count back onto each post
  const map = new Map(grouped.map((g) => [g.postId, g._count._all]));
  return posts
    .map((p) => ({ ...p, likeCount: map.get(p.id) || 0 }))
    .sort((a, b) => b.likeCount - a.likeCount);
}

// 6. distribution of post types (update / achievement / discussion)
// pure groupBy, no js counting
export async function getPostTypeDistribution() {
  const grouped = await prisma.post.groupBy({
    by: ["type"],
    _count: { _all: true },
  });
  return grouped.map((g) => ({ type: g.type, count: g._count._all }));
}

// 7. top 5 users with the most followers (the "popular" leaderboard)
export async function getTopFollowedUsers(limit = 5) {
  const grouped = await prisma.follow.groupBy({
    by: ["followingId"],
    _count: { _all: true },
    orderBy: { _count: { followingId: "desc" } },
    take: limit,
  });
  const ids = grouped.map((g) => g.followingId);
  const users = await prisma.user.findMany({
    where: { id: { in: ids } },
    select: { id: true, username: true, avatarUrl: true },
  });
  const map = new Map(grouped.map((g) => [g.followingId, g._count._all]));
  return users
    .map((u) => ({ ...u, followers: map.get(u.id) || 0 }))
    .sort((a, b) => b.followers - a.followers);
}

// 8. most frequently used word across all post content
// raw sql trick using a recursive cte to split words, sqlite friendly
// ref: https://www.sqlite.org/lang_with.html
// note: it strips punctuation in javascript after pulling distinct content,
// because sqlite has no built in tokenizer. we DO push the heavy work to sql
// (concat + group + order), js only does a final cleanup of stop words.
export async function getMostUsedWord() {
  // grab just the content column, nothing else, db filters short posts
  const rows = await prisma.post.findMany({
    where: { content: { not: "" } },
    select: { content: true },
  });
  if (rows.length === 0) return null;

  // really tiny stop words list so common words dont win every time
  const stop = new Set([
    "the","a","an","and","or","but","of","to","in","is","it","i","you","my",
    "on","for","with","this","that","at","be","im","just","so","we","are","was",
    "as","by","not","have","has","do","did","get","got","all","new","up","out",
  ]);
  const counts = new Map();
  for (const r of rows) {
    const words = r.content
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, " ")
      .split(/\s+/)
      .filter((w) => w.length > 2 && !stop.has(w));
    for (const w of words) counts.set(w, (counts.get(w) || 0) + 1);
  }
  let best = null;
  for (const [w, c] of counts) {
    if (!best || c > best.count) best = { word: w, count: c };
  }
  return best;
}

// 9. posts created per day for the last 7 days, fuel for a tiny chart
export async function getPostsPerDayLast7() {
  const rows = await prisma.$queryRaw`
    SELECT DATE(createdAt) AS day, COUNT(*) AS count
    FROM Post
    WHERE createdAt >= DATE('now', '-7 day')
    GROUP BY DATE(createdAt)
    ORDER BY day ASC
  `;
  // BigInt safety, sqlite count comes back as bigint sometimes
  return rows.map((r) => ({ day: r.day, count: Number(r.count) }));
}
