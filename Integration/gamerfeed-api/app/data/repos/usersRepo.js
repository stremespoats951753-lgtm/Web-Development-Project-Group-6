import { prisma } from "../prisma.js";

export async function getAllUsers() {
    return prisma.user.findMany({
        select: {
            id: true,
            username: true,
            email: true,
            bio: true,
            avatar: true,
            createdAt: true,
            _count: {
                select: {
                    posts: true,
                    followers: true,
                    following: true,
                },
            },
        },
        orderBy: {
            createdAt: "desc",
        },
    });
}

export async function getUserById(id) {
    return prisma.user.findUnique({
        where: {
            id: Number(id),
        },
        select: {
            id: true,
            username: true,
            email: true,
            bio: true,
            avatar: true,
            createdAt: true,
            _count: {
                select: {
                    posts: true,
                    followers: true,
                    following: true,
                },
            },
        },
    });
}

export async function getUserByEmail(email) {
    return prisma.user.findUnique({
        where: {
            email: email.toLowerCase(),
        },
    });
}

export async function createUser(data) {
    return prisma.user.create({
        data: {
            username: data.username,
            email: data.email.toLowerCase(),
            password: data.password,
            bio: data.bio || "New gamer in the arena.",
            avatar: data.avatar || data.username.slice(0, 2).toUpperCase(),
        },
        select: {
            id: true,
            username: true,
            email: true,
            bio: true,
            avatar: true,
            createdAt: true,
        },
    });
}

export async function updateUser(id, data) {
    return prisma.user.update({
        where: {
            id: Number(id),
        },
        data: {
            username: data.username,
            bio: data.bio,
            avatar: data.avatar,
        },
        select: {
            id: true,
            username: true,
            email: true,
            bio: true,
            avatar: true,
            createdAt: true,
            _count: {
                select: {
                    posts: true,
                    followers: true,
                    following: true,
                },
            },
        },
    });
}

export async function deleteUser(id) {
    return prisma.user.delete({
        where: {
            id: Number(id),
        },
    });
}