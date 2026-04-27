import { prisma } from "../prisma.js";

export async function followUser(followerId, followingId) {
    if (Number(followerId) === Number(followingId)) {
        throw new Error("Users cannot follow themselves.");
    }

    return prisma.follow.upsert({
        where: {
            followerId_followingId: {
                followerId: Number(followerId),
                followingId: Number(followingId),
            },
        },
        update: {},
        create: {
            followerId: Number(followerId),
            followingId: Number(followingId),
        },
    });
}

export async function unfollowUser(followerId, followingId) {
    return prisma.follow.delete({
        where: {
            followerId_followingId: {
                followerId: Number(followerId),
                followingId: Number(followingId),
            },
        },
    });
}

export async function getFollowing(userId) {
    return prisma.follow.findMany({
        where: {
            followerId: Number(userId),
        },
        select: {
            following: {
                select: {
                    id: true,
                    username: true,
                    avatar: true,
                    bio: true,
                },
            },
        },
    });
}

export async function getFollowers(userId) {
    return prisma.follow.findMany({
        where: {
            followingId: Number(userId),
        },
        select: {
            follower: {
                select: {
                    id: true,
                    username: true,
                    avatar: true,
                    bio: true,
                },
            },
        },
    });
}

export async function isFollowing(followerId, followingId) {
    const follow = await prisma.follow.findUnique({
        where: {
            followerId_followingId: {
                followerId: Number(followerId),
                followingId: Number(followingId),
            },
        },
    });

    return Boolean(follow);
}