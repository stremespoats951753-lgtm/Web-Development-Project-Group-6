// GET /api/stats - bundles every statistic the /stats page needs
// the route is super thin, it just calls the repo and returns the result
import {
  getTotals,
  getAverageFollowersPerUser,
  getAveragePostsPerUser,
  getMostActiveUserLast3Months,
  getTopLikedPosts,
  getPostTypeDistribution,
  getTopFollowedUsers,
  getMostUsedWord,
  getPostsPerDayLast7,
} from "@/repositories/statsRepo";
import { json } from "@/lib/api";

export async function GET() {
  const [
    totals,
    avgFollowers,
    avgPosts,
    mostActive,
    topLiked,
    typeDist,
    topFollowed,
    mostUsedWord,
    perDay,
  ] = await Promise.all([
    getTotals(),
    getAverageFollowersPerUser(),
    getAveragePostsPerUser(),
    getMostActiveUserLast3Months(),
    getTopLikedPosts(),
    getPostTypeDistribution(),
    getTopFollowedUsers(),
    getMostUsedWord(),
    getPostsPerDayLast7(),
  ]);
  return json({
    totals,
    avgFollowers,
    avgPosts,
    mostActive,
    topLiked,
    typeDist,
    topFollowed,
    mostUsedWord,
    perDay,
  });
}
