import { prisma } from "../prisma.js";

export async function getPlatformStats() {
    const [
        totalUsers,
        totalPosts,
        totalComments,
        totalLikes,
        totalFollows,
        postsByType,
        mostLikedPosts,
        mostCommentedPosts,
        mostActiveUsers,
    ] = await Promise.all([
        prisma.user.count(),
        prisma.post.count(),
        prisma.comment.count(),
        prisma.like.count(),
        prisma.follow.count(),

        prisma.post.groupBy({
            by: ["type"],
            _count: {
                type: true,
            },
        }),

        prisma.post.findMany({
            take: 5,
            orderBy: {
                likes: {
                    _count: "desc",
                },
            },
            select: {
                id: true,
                title: true,
                type: true,
                game: true,
                user: {
                    select: {
                        id: true,
                        username: true,
                    },
                },
                _count: {
                    select: {
                        likes: true,
                        comments: true,
                    },
                },
            },
        }),

        prisma.post.findMany({
            take: 5,
            orderBy: {
                comments: {
                    _count: "desc",
                },
            },
            select: {
                id: true,
                title: true,
                type: true,
                game: true,
                user: {
                    select: {
                        id: true,
                        username: true,
                    },
                },
                _count: {
                    select: {
                        likes: true,
                        comments: true,
                    },
                },
            },
        }),

        prisma.user.findMany({
            take: 5,
            orderBy: {
                posts: {
                    _count: "desc",
                },
            },
            select: {
                id: true,
                username: true,
                avatar: true,
                _count: {
                    select: {
                        posts: true,
                        comments: true,
                        likes: true,
                        followers: true,
                        following: true,
                    },
                },
            },
        }),
    ]);

    return {
        totalUsers,
        totalPosts,
        totalComments,
        totalLikes,
        totalFollows,

        postsByType: postsByType.reduce((acc, item) => {
            acc[item.type] = item._count.type;
            return acc;
        }, {}),

        mostLikedPosts,
        mostCommentedPosts,
        mostActiveUsers,

        averageLikesPerPost:
            totalPosts === 0 ? 0 : Number((totalLikes / totalPosts).toFixed(1)),

        averageCommentsPerPost:
            totalPosts === 0 ? 0 : Number((totalComments / totalPosts).toFixed(1)),

        averageFollowersPerUser:
            totalUsers === 0 ? 0 : Number((totalFollows / totalUsers).toFixed(1)),
    };
}