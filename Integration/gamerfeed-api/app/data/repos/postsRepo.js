import { prisma } from "../prisma.js";

const postSelect = {
    id: true,
    type: true,
    game: true,
    title: true,
    content: true,
    hasAchievement: true,
    achievementName: true,
    createdAt: true,
    updatedAt: true,

    user: {
        select: {
            id: true,
            username: true,
            avatar: true,
        },
    },

    likes: {
        select: {
            userId: true,
        },
    },

    comments: {
        select: {
            id: true,
            text: true,
            createdAt: true,
            user: {
                select: {
                    id: true,
                    username: true,
                    avatar: true,
                },
            },
        },
        orderBy: {
            createdAt: "asc",
        },
    },

    _count: {
        select: {
            likes: true,
            comments: true,
        },
    },
};

export async function getAllPosts(filters = {}) {
    const where = {};

    if (filters.type && filters.type !== "all") {
        where.type = filters.type;
    }

    if (filters.userId) {
        where.userId = Number(filters.userId);
    }

    return prisma.post.findMany({
        where,
        select: postSelect,
        orderBy: {
            createdAt: "desc",
        },
    });
}

export async function getPostById(id) {
    return prisma.post.findUnique({
        where: {
            id: Number(id),
        },
        select: {
            ...postSelect,
            comments: {
                orderBy: {
                    createdAt: "asc",
                },
                select: {
                    id: true,
                    text: true,
                    createdAt: true,
                    user: {
                        select: {
                            id: true,
                            username: true,
                            avatar: true,
                        },
                    },
                },
            },
            likes: {
                select: {
                    userId: true,
                },
            },
        },
    });
}

export async function createPost(data) {
    return prisma.post.create({
        data: {
            userId: Number(data.userId),
            type: data.type || "update",
            game: data.game || "Your Game",
            title: data.title,
            content: data.content,
            hasAchievement: data.type === "achievement",
            achievementName: data.type === "achievement" ? data.title : null,
        },
        select: postSelect,
    });
}

export async function updatePost(id, data) {
    return prisma.post.update({
        where: {
            id: Number(id),
        },
        data: {
            ...(data.type && { type: data.type }),
            ...(data.game && { game: data.game }),
            ...(data.title && { title: data.title }),
            ...(data.content && { content: data.content }),
            ...(data.type && {
                hasAchievement: data.type === "achievement",
                achievementName: data.type === "achievement" ? data.title : null,
            }),
        },
        select: postSelect,
    });
}

export async function deletePost(id) {
    return prisma.post.delete({
        where: {
            id: Number(id),
        },
    });
}

export async function getFeedPostsForUser(userId, type = "all") {
    const currentUserId = Number(userId);

    const following = await prisma.follow.findMany({
        where: {
            followerId: currentUserId,
        },
        select: {
            followingId: true,
        },
    });

    const followingIds = following.map((item) => item.followingId);

    const visibleUserIds = [currentUserId, ...followingIds];

    return prisma.post.findMany({
        where: {
            userId: {
                in: visibleUserIds,
            },
            ...(type !== "all" && { type }),
        },
        select: postSelect,
        orderBy: {
            createdAt: "desc",
        },
    });
}