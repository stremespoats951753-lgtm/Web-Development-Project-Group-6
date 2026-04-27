import { prisma } from "../prisma.js";

export async function getCommentsByPostId(postId) {
    return prisma.comment.findMany({
        where: {
            postId: Number(postId),
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
        orderBy: {
            createdAt: "asc",
        },
    });
}

export async function createComment(postId, data) {
    return prisma.comment.create({
        data: {
            postId: Number(postId),
            userId: Number(data.userId),
            text: data.text,
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
    });
}

export async function deleteComment(id) {
    return prisma.comment.delete({
        where: {
            id: Number(id),
        },
    });
}