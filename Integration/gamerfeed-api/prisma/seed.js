import { PrismaClient } from "../app/generated/prisma/client.js";

const prisma = new PrismaClient();

async function main() {
    await prisma.like.deleteMany();
    await prisma.comment.deleteMany();
    await prisma.follow.deleteMany();
    await prisma.post.deleteMany();
    await prisma.user.deleteMany();

    const nightKira = await prisma.user.create({
        data: {
            username: "NightKira",
            email: "nightkira@gamerfeed.demo",
            password: "123456",
            bio: "Competitive player, achievement hunter, and ranked grinder.",
            avatar: "NK",
        },
    });

    const axelRift = await prisma.user.create({
        data: {
            username: "AxelRift",
            email: "axelrift@gamerfeed.demo",
            password: "123456",
            bio: "Patch-note addict, RPG fan, and build optimizer.",
            avatar: "AX",
        },
    });

    const voidX = await prisma.user.create({
        data: {
            username: "VoidX",
            email: "voidx@gamerfeed.demo",
            password: "123456",
            bio: "Soulslike fan. Long threads, hard bosses, zero regrets.",
            avatar: "VX",
        },
    });

    const stormFang = await prisma.user.create({
        data: {
            username: "StormFang",
            email: "stormfang@gamerfeed.demo",
            password: "123456",
            bio: "FPS, co-op missions, and squad-based chaos.",
            avatar: "SF",
        },
    });

    const pixelMage = await prisma.user.create({
        data: {
            username: "PixelMage",
            email: "pixelmage@gamerfeed.demo",
            password: "123456",
            bio: "Indie games, cozy games, and pixel art adventures.",
            avatar: "PM",
        },
    });

    const riftRunner = await prisma.user.create({
        data: {
            username: "RiftRunner",
            email: "riftrunner@gamerfeed.demo",
            password: "123456",
            bio: "MOBA, Apex, and ranked ladder suffering.",
            avatar: "RR",
        },
    });

    const cyberNova = await prisma.user.create({
        data: {
            username: "CyberNova",
            email: "cybernova@gamerfeed.demo",
            password: "123456",
            bio: "Open-world games, screenshots, and cyberpunk builds.",
            avatar: "CN",
        },
    });

    const questQueen = await prisma.user.create({
        data: {
            username: "QuestQueen",
            email: "questqueen@gamerfeed.demo",
            password: "123456",
            bio: "MMO healer main. Raids, quests, and guild stories.",
            avatar: "QQ",
        },
    });

    await prisma.follow.createMany({
        data: [
            { followerId: nightKira.id, followingId: axelRift.id },
            { followerId: nightKira.id, followingId: voidX.id },
            { followerId: nightKira.id, followingId: stormFang.id },

            { followerId: axelRift.id, followingId: nightKira.id },
            { followerId: axelRift.id, followingId: stormFang.id },
            { followerId: axelRift.id, followingId: cyberNova.id },

            { followerId: voidX.id, followingId: nightKira.id },
            { followerId: voidX.id, followingId: axelRift.id },
            { followerId: voidX.id, followingId: riftRunner.id },

            { followerId: stormFang.id, followingId: voidX.id },
            { followerId: stormFang.id, followingId: nightKira.id },
            { followerId: stormFang.id, followingId: questQueen.id },

            { followerId: pixelMage.id, followingId: axelRift.id },
            { followerId: pixelMage.id, followingId: cyberNova.id },
            { followerId: pixelMage.id, followingId: questQueen.id },

            { followerId: riftRunner.id, followingId: stormFang.id },
            { followerId: riftRunner.id, followingId: nightKira.id },
            { followerId: riftRunner.id, followingId: pixelMage.id },

            { followerId: cyberNova.id, followingId: pixelMage.id },
            { followerId: cyberNova.id, followingId: voidX.id },
            { followerId: cyberNova.id, followingId: axelRift.id },

            { followerId: questQueen.id, followingId: stormFang.id },
            { followerId: questQueen.id, followingId: axelRift.id },
            { followerId: questQueen.id, followingId: pixelMage.id },
        ],
    });

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
            title: "New Patch Changes Everything",
            content:
                "The new Cyberpunk patch feels exciting. Vehicle combat is improved, crafting is simpler, and Night City feels alive again.",
            hasAchievement: false,
            achievementName: null,
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
            hasAchievement: false,
            achievementName: null,
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
            hasAchievement: false,
            achievementName: null,
            createdAt: new Date("2026-03-14T22:18:00"),
        },
    });

    const post5 = await prisma.post.create({
        data: {
            userId: pixelMage.id,
            type: "update",
            game: "Stardew Valley",
            title: "Farm Redesign Complete",
            content:
                "I finally reorganized my farm layout. The greenhouse area is cleaner, and the animal section is easier to manage.",
            hasAchievement: false,
            achievementName: null,
            createdAt: new Date("2026-03-14T18:40:00"),
        },
    });

    const post6 = await prisma.post.create({
        data: {
            userId: riftRunner.id,
            type: "achievement",
            game: "Apex Legends",
            title: "First 2K Damage Badge",
            content:
                "Finally earned my first 2K damage badge. Playing safer and choosing better fights made the difference.",
            hasAchievement: true,
            achievementName: "2K Damage Badge",
            createdAt: new Date("2026-03-14T16:25:00"),
        },
    });

    const post7 = await prisma.post.create({
        data: {
            userId: cyberNova.id,
            type: "discussion",
            game: "Open World Games",
            title: "Do Open Worlds Need Smaller Maps?",
            content:
                "I would rather have a smaller map full of meaningful locations than a huge world with repeated content.",
            hasAchievement: false,
            achievementName: null,
            createdAt: new Date("2026-03-14T13:15:00"),
        },
    });

    const post8 = await prisma.post.create({
        data: {
            userId: questQueen.id,
            type: "update",
            game: "Final Fantasy XIV",
            title: "Raid Night Was Rough",
            content:
                "We got close to clearing but kept wiping at the final mechanic. Still, progress is progress.",
            hasAchievement: false,
            achievementName: null,
            createdAt: new Date("2026-03-13T23:00:00"),
        },
    });

    const post9 = await prisma.post.create({
        data: {
            userId: voidX.id,
            type: "achievement",
            game: "Dark Souls III",
            title: "Nameless King Down",
            content:
                "This fight tested my patience. The camera was half the battle, but the win felt amazing.",
            hasAchievement: true,
            achievementName: "King Slayer",
            createdAt: new Date("2026-03-13T20:45:00"),
        },
    });

    const post10 = await prisma.post.create({
        data: {
            userId: axelRift.id,
            type: "discussion",
            game: "Baldur's Gate 3",
            title: "Best Companion Storyline?",
            content:
                "Shadowheart has the strongest character arc for me, but Astarion is very close. Curious what everyone thinks.",
            hasAchievement: false,
            achievementName: null,
            createdAt: new Date("2026-03-13T17:20:00"),
        },
    });

    const post11 = await prisma.post.create({
        data: {
            userId: stormFang.id,
            type: "achievement",
            game: "Forza Horizon 5",
            title: "Clean Race Win",
            content:
                "Won an online race without hitting walls or other players. Honestly harder than it sounds.",
            hasAchievement: true,
            achievementName: "Clean Driver",
            createdAt: new Date("2026-03-13T15:05:00"),
        },
    });

    const post12 = await prisma.post.create({
        data: {
            userId: nightKira.id,
            type: "discussion",
            game: "Valorant",
            title: "Best Agent for Solo Queue?",
            content:
                "Controllers are underrated in solo queue, but duelists can carry harder. What role do you think is best?",
            hasAchievement: false,
            achievementName: null,
            createdAt: new Date("2026-03-13T11:30:00"),
        },
    });

    const post13 = await prisma.post.create({
        data: {
            userId: pixelMage.id,
            type: "achievement",
            game: "Hollow Knight",
            title: "Path of Pain Finished",
            content:
                "I do not know why I put myself through this, but finishing it felt incredible.",
            hasAchievement: true,
            achievementName: "Path of Pain Complete",
            createdAt: new Date("2026-03-12T22:35:00"),
        },
    });

    const post14 = await prisma.post.create({
        data: {
            userId: cyberNova.id,
            type: "update",
            game: "Cyberpunk 2077",
            title: "Night City Photo Mode",
            content:
                "I spent more time taking screenshots than finishing missions today. The lighting in this game is still beautiful.",
            hasAchievement: false,
            achievementName: null,
            createdAt: new Date("2026-03-12T19:50:00"),
        },
    });

    const post15 = await prisma.post.create({
        data: {
            userId: questQueen.id,
            type: "achievement",
            game: "World of Warcraft",
            title: "Mythic Dungeon Timed",
            content:
                "Timed a difficult mythic dungeon with only seconds left. The healer stress was real.",
            hasAchievement: true,
            achievementName: "Mythic Timer Cleared",
            createdAt: new Date("2026-03-12T16:10:00"),
        },
    });

    const post16 = await prisma.post.create({
        data: {
            userId: riftRunner.id,
            type: "discussion",
            game: "Overwatch 2",
            title: "Support Role Feels Stressful",
            content:
                "Support is fun, but sometimes it feels like you are responsible for everything. Any tips from support mains?",
            hasAchievement: false,
            achievementName: null,
            createdAt: new Date("2026-03-12T12:45:00"),
        },
    });

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
                postId: post1.id,
                userId: stormFang.id,
                text: "Platinum on Elden Ring is a real grind.",
                createdAt: new Date("2026-03-15T15:20:00"),
            },
            {
                postId: post2.id,
                userId: stormFang.id,
                text: "Vehicle combat needed this update badly.",
                createdAt: new Date("2026-03-15T12:30:00"),
            },
            {
                postId: post2.id,
                userId: cyberNova.id,
                text: "Night City feels much better after the recent updates.",
                createdAt: new Date("2026-03-15T12:55:00"),
            },
            {
                postId: post3.id,
                userId: nightKira.id,
                text: "Completely agree. A good single-player game still sells.",
                createdAt: new Date("2026-03-15T10:15:00"),
            },
            {
                postId: post3.id,
                userId: pixelMage.id,
                text: "I think both can exist, but complete games need more support.",
                createdAt: new Date("2026-03-15T10:35:00"),
            },
            {
                postId: post4.id,
                userId: riftRunner.id,
                text: "I am joining later tonight.",
                createdAt: new Date("2026-03-14T22:45:00"),
            },
            {
                postId: post5.id,
                userId: questQueen.id,
                text: "Farm redesigns always take longer than expected.",
                createdAt: new Date("2026-03-14T19:05:00"),
            },
            {
                postId: post6.id,
                userId: stormFang.id,
                text: "2K badge is a solid milestone.",
                createdAt: new Date("2026-03-14T16:50:00"),
            },
            {
                postId: post7.id,
                userId: voidX.id,
                text: "Smaller but denser worlds are usually better.",
                createdAt: new Date("2026-03-14T13:50:00"),
            },
            {
                postId: post8.id,
                userId: axelRift.id,
                text: "Progress is still progress. Clear is coming soon.",
                createdAt: new Date("2026-03-13T23:25:00"),
            },
            {
                postId: post9.id,
                userId: axelRift.id,
                text: "Nameless King is still one of the best boss fights.",
                createdAt: new Date("2026-03-13T21:10:00"),
            },
            {
                postId: post10.id,
                userId: pixelMage.id,
                text: "Shadowheart has my vote too.",
                createdAt: new Date("2026-03-13T17:45:00"),
            },
            {
                postId: post11.id,
                userId: nightKira.id,
                text: "Clean racing online is harder than winning sometimes.",
                createdAt: new Date("2026-03-13T15:30:00"),
            },
            {
                postId: post12.id,
                userId: stormFang.id,
                text: "Controller is great if your team actually plays around smokes.",
                createdAt: new Date("2026-03-13T12:00:00"),
            },
            {
                postId: post13.id,
                userId: voidX.id,
                text: "Path of Pain is pure suffering.",
                createdAt: new Date("2026-03-12T23:00:00"),
            },
            {
                postId: post14.id,
                userId: pixelMage.id,
                text: "Photo mode is half the game at this point.",
                createdAt: new Date("2026-03-12T20:10:00"),
            },
            {
                postId: post15.id,
                userId: riftRunner.id,
                text: "Timing with seconds left is peak MMO adrenaline.",
                createdAt: new Date("2026-03-12T16:45:00"),
            },
            {
                postId: post16.id,
                userId: questQueen.id,
                text: "Support mains deserve more respect.",
                createdAt: new Date("2026-03-12T13:05:00"),
            },
        ],
    });

    await prisma.like.createMany({
        data: [
            { postId: post1.id, userId: axelRift.id },
            { postId: post1.id, userId: voidX.id },
            { postId: post1.id, userId: stormFang.id },
            { postId: post1.id, userId: riftRunner.id },

            { postId: post2.id, userId: nightKira.id },
            { postId: post2.id, userId: stormFang.id },
            { postId: post2.id, userId: cyberNova.id },

            { postId: post3.id, userId: nightKira.id },
            { postId: post3.id, userId: axelRift.id },
            { postId: post3.id, userId: stormFang.id },
            { postId: post3.id, userId: pixelMage.id },

            { postId: post4.id, userId: nightKira.id },
            { postId: post4.id, userId: voidX.id },
            { postId: post4.id, userId: riftRunner.id },

            { postId: post5.id, userId: questQueen.id },
            { postId: post5.id, userId: cyberNova.id },

            { postId: post6.id, userId: nightKira.id },
            { postId: post6.id, userId: stormFang.id },
            { postId: post6.id, userId: questQueen.id },

            { postId: post7.id, userId: axelRift.id },
            { postId: post7.id, userId: voidX.id },
            { postId: post7.id, userId: pixelMage.id },

            { postId: post8.id, userId: stormFang.id },
            { postId: post8.id, userId: axelRift.id },

            { postId: post9.id, userId: nightKira.id },
            { postId: post9.id, userId: axelRift.id },
            { postId: post9.id, userId: questQueen.id },

            { postId: post10.id, userId: pixelMage.id },
            { postId: post10.id, userId: cyberNova.id },
            { postId: post10.id, userId: nightKira.id },

            { postId: post11.id, userId: nightKira.id },
            { postId: post11.id, userId: stormFang.id },

            { postId: post12.id, userId: axelRift.id },
            { postId: post12.id, userId: stormFang.id },
            { postId: post12.id, userId: riftRunner.id },

            { postId: post13.id, userId: voidX.id },
            { postId: post13.id, userId: pixelMage.id },
            { postId: post13.id, userId: questQueen.id },

            { postId: post14.id, userId: cyberNova.id },
            { postId: post14.id, userId: pixelMage.id },

            { postId: post15.id, userId: questQueen.id },
            { postId: post15.id, userId: riftRunner.id },
            { postId: post15.id, userId: stormFang.id },

            { postId: post16.id, userId: questQueen.id },
            { postId: post16.id, userId: axelRift.id },
        ],
    });
}

main()
    .catch(() => {
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });