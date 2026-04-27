import { prisma } from "../prisma.js";

export async function likePost(postId, userId) {
    return prisma.like.upsert({
        where: {
            postId_userId: {
                postId: Number(postId),
                userId: Number(userId),
            },
        },
        update: {},
        create: {
            postId: Number(postId),
            userId: Number(userId),
        },
    });
}

export async function unlikePost(postId, userId) {
    return prisma.like.delete({
        where: {
            postId_userId: {
                postId: Number(postId),
                userId: Number(userId),
            },
        },
    });
}

export async function hasUserLikedPost(postId, userId) {
    const like = await prisma.like.findUnique({
        where: {
            postId_userId: {
                postId: Number(postId),
                userId: Number(userId),
            },
        },
    });

    return Boolean(like);
}

export async function getPostLikeCount(postId) {
    return prisma.like.count({
        where: {
            postId: Number(postId),
        },
    });
}