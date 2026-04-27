
import { PrismaClient } from "../app/generated/prisma/client.js";
import { promises as fs } from "fs";
import path from "path";

const prisma = new PrismaClient();


async function main() {
    // Clear old data in correct order
    await prisma.like.deleteMany();
    await prisma.comment.deleteMany();
    await prisma.follow.deleteMany();
    await prisma.post.deleteMany();
    await prisma.user.deleteMany();

    // Users
    const nightKira = await prisma.user.create({
        data: {
            username: "NightKira",
            email: "nightkira@gamerfeed.demo",
            password: "123456",
            bio: "Achievement hunter and soulslike grinder.",
            avatar: "NK",
        },
    });

    const axelRift = await prisma.user.create({
        data: {
            username: "AxelRift",
            email: "axelrift@gamerfeed.demo",
            password: "123456",
            bio: "Patch-note addict and RPG fan.",
            avatar: "AX",
        },
    });

    const voidX = await prisma.user.create({
        data: {
            username: "VoidX",
            email: "voidx@gamerfeed.demo",
            password: "123456",
            bio: "Hot takes, long threads, zero regrets.",
            avatar: "VX",
        },
    });

    const stormFang = await prisma.user.create({
        data: {
            username: "StormFang",
            email: "stormfang@gamerfeed.demo",
            password: "123456",
            bio: "Always answering the call for Super Earth.",
            avatar: "SF",
        },
    });

    // Follows
    await prisma.follow.createMany({
        data: [
            { followerId: nightKira.id, followingId: axelRift.id },
            { followerId: nightKira.id, followingId: voidX.id },
            { followerId: axelRift.id, followingId: nightKira.id },
            { followerId: axelRift.id, followingId: stormFang.id },
            { followerId: voidX.id, followingId: nightKira.id },
            { followerId: stormFang.id, followingId: voidX.id },
        ],
    });

    // Posts
    const post1 = await prisma.post.create({
        data: {
            userId: nightKira.id,
            type: "achievement",
            game: "Elden Ring",
            title: "Finally Got the Platinum!",
            content:
                "After 200+ hours, I finally got the Platinum Trophy for Elden Ring. The hardest part was the Malenia fight. Worth every second.",
            hasAchievement: true,
            achievementName: "Elden Ring Platinum",
            createdAt: new Date("2026-03-15T14:32:00"),
        },
    });

    const post2 = await prisma.post.create({
        data: {
            userId: axelRift.id,
            type: "update",
            game: "Cyberpunk 2077",
            title: "New 2.5 Patch Changes Everything",
            content:
                "The new Cyberpunk patch feels exciting. Vehicle combat is improved, crafting is simpler, and Night City feels alive again.",
            createdAt: new Date("2026-03-15T12:10:00"),
        },
    });

    const post3 = await prisma.post.create({
        data: {
            userId: voidX.id,
            type: "discussion",
            game: "General",
            title: "Are Live Service Games Killing Single Player?",
            content:
                "The success of single-player games proves that players still want complete and well-crafted experiences.",
            createdAt: new Date("2026-03-15T09:55:00"),
        },
    });

    const post4 = await prisma.post.create({
        data: {
            userId: stormFang.id,
            type: "update",
            game: "Helldivers 2",
            title: "Super Earth Under Attack",
            content:
                "The new Major Order just dropped. We need every Helldiver on deck right now.",
            createdAt: new Date("2026-03-14T22:18:00"),
        },
    });

    // Comments
    await prisma.comment.createMany({
        data: [
            {
                postId: post1.id,
                userId: axelRift.id,
                text: "Congrats! That fight is brutal.",
                createdAt: new Date("2026-03-15T14:45:00"),
            },
            {
                postId: post1.id,
                userId: voidX.id,
                text: "Insane achievement. Respect.",
                createdAt: new Date("2026-03-15T15:01:00"),
            },
            {
                postId: post2.id,
                userId: stormFang.id,
                text: "Vehicle combat needed this update badly.",
                createdAt: new Date("2026-03-15T12:30:00"),
            },
            {
                postId: post3.id,
                userId: nightKira.id,
                text: "Completely agree. A good single-player game still sells.",
                createdAt: new Date("2026-03-15T10:15:00"),
            },
        ],
    });

    // Likes
    await prisma.like.createMany({
        data: [
            { postId: post1.id, userId: axelRift.id },
            { postId: post1.id, userId: voidX.id },
            { postId: post1.id, userId: stormFang.id },

            { postId: post2.id, userId: nightKira.id },
            { postId: post2.id, userId: stormFang.id },

            { postId: post3.id, userId: nightKira.id },
            { postId: post3.id, userId: axelRift.id },
            { postId: post3.id, userId: stormFang.id },

            { postId: post4.id, userId: nightKira.id },
            { postId: post4.id, userId: voidX.id },
        ],
    });

    console.log("Database seeded successfully.");
}

main()
    .catch((error) => {
        console.error("Seed failed:", error);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });