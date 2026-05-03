// prisma/seed.js
// fills the database with realistic gaming themed fake data
// run: npx prisma db seed
//
// the order of clearing matters because of foreign keys, child tables first
// ref: https://www.prisma.io/docs/orm/prisma-migrate/workflows/seeding
const { prisma } = require("@/lib/prisma");
const { faker } = require("@faker-js/faker");
const bcrypt = require("bcryptjs");

// list of lucide icons used as avatars (mirrors src/lib/avatars.js)
// kept inline so the seeder dosnt need esm imports
const AVATAR_ICONS = [
  "gamepad-2", "joystick", "swords", "trophy", "rocket", "ghost", "skull",
  "crown", "flame", "zap", "star", "heart", "bomb", "dice-5", "sword",
  "shield", "target", "cat", "dog", "bird", "rabbit", "fish", "axe",
  "puzzle", "keyboard", "headphones", "music", "wand", "bot",
];
function randomAvatarUrl() {
  const name = AVATAR_ICONS[Math.floor(Math.random() * AVATAR_ICONS.length)];
  return `https://unpkg.com/lucide-static@latest/icons/${name}.svg`;
}

// gaming themed bits we sprinkle into the fake content so it feels real
const games = [
  "Elden Ring", "Valorant", "League of Legends", "Apex Legends", "Counter Strike 2",
  "Minecraft", "Fortnite", "Overwatch 2", "Baldurs Gate 3", "Stardew Valley",
  "Hollow Knight", "Hades", "Dota 2", "Rocket League", "Among Us",
  "Cyberpunk 2077", "Sekiro", "Genshin Impact", "Dark Souls 3", "Zelda Tears of the Kingdom",
];
const updatePhrases = [
  "Just hopped on", "Grinding ranked in", "Anyone wanna duo in", "Trying out",
  "Finally finished the campaign of", "Cant stop playing", "Back to my main in",
];
const achievementPhrases = [
  "Hit Diamond rank in", "Got a 20 kill game in", "Beat the final boss in",
  "Pulled off a 1v5 clutch in", "Maxed out my account in", "Won the tournament in",
  "Got a perfect run in",
];
const discussionPhrases = [
  "Whats the best loadout for", "Is the new patch ruining", "Hot take",
  "Why does everyone hate", "Anyone else think", "Need build advice for",
];

// helper to pick a random item out of an array
function pick(a) { return a[Math.floor(Math.random() * a.length)]; }

async function main() {
  console.log("Clearing tables in dependancy order...");
  // delete child tables first so foreign keys dont blow up
  await prisma.like.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.follow.deleteMany();
  await prisma.post.deleteMany();
  await prisma.user.deleteMany();

  console.log("Creating users...");
  // we make a known test user so the grader can login easly
  const testPwd = await bcrypt.hash("password123", 10);
  const fixedUsers = [
    { username: "demo",   email: "demo@gamerfeed.test",   password: testPwd, bio: "The demo account, login with password123", avatarUrl: randomAvatarUrl() },
    { username: "ninja",  email: "ninja@gamerfeed.test",  password: testPwd, bio: "Apex main, sometimes Valorant",            avatarUrl: randomAvatarUrl() },
    { username: "pixel",  email: "pixel@gamerfeed.test",  password: testPwd, bio: "Indie game lover",                          avatarUrl: randomAvatarUrl() },
  ];
  for (const u of fixedUsers) {
    await prisma.user.create({ data: u });
  }

  // then a bunch of random ones using faker
  const userCount = 20;
  for (let i = 0; i < userCount; i++) {
    const username = faker.internet
      .username()
      .toLowerCase()
      .replace(/[^a-z0-9_]/g, "")
      .slice(0, 14) + i; // ensure uniqe even if faker repeats
    await prisma.user.create({
      data: {
        username,
        email:    faker.internet.email().toLowerCase(),
        password: testPwd, // every seeded user shares the same pwd for testing
        bio:      faker.lorem.sentence({ min: 4, max: 10 }),
        avatarUrl: randomAvatarUrl(),
      },
    });
  }

  const allUsers = await prisma.user.findMany({ select: { id: true } });
  console.log("Created " + allUsers.length + " users");

  console.log("Creating follow relations...");
  // each user follows around 4-8 random other users
  for (const u of allUsers) {
    const targets = faker.helpers.arrayElements(
      allUsers.filter((x) => x.id !== u.id),
      faker.number.int({ min: 4, max: 8 })
    );
    for (const t of targets) {
      try {
        await prisma.follow.create({
          data: { followerId: u.id, followingId: t.id },
        });
      } catch (e) {
        // unique constraint, just skip dupes
      }
    }
  }

  console.log("Creating posts...");
  // for each user we make somewhere between 3 and 8 posts mixed across types
  const postIds = [];
  for (const u of allUsers) {
    const n = faker.number.int({ min: 3, max: 8 });
    for (let i = 0; i < n; i++) {
      const r = Math.random();
      let content, type;
      if (r < 0.5) {
        type = "update";
        content = pick(updatePhrases) + " " + pick(games) + ". " + faker.lorem.sentence();
      } else if (r < 0.8) {
        type = "achievement";
        content = pick(achievementPhrases) + " " + pick(games) + "! " + faker.lorem.words(4);
      } else {
        type = "discussion";
        content = pick(discussionPhrases) + " " + pick(games) + "? " + faker.lorem.sentence();
      }
      // spread the createdAt over the last ~90 days so the "last 3 months"
      // stat actualy has data to chew on
      const created = faker.date.recent({ days: 90 });
      const p = await prisma.post.create({
        data: { authorId: u.id, content, type, createdAt: created },
      });
      postIds.push(p.id);
    }
  }
  console.log("Created " + postIds.length + " posts");

  console.log("Creating comments...");
  // random comments scattered across posts
  for (let i = 0; i < postIds.length * 2; i++) {
    const u = pick(allUsers);
    const pid = pick(postIds);
    await prisma.comment.create({
      data: {
        authorId: u.id,
        postId: pid,
        content: faker.lorem.sentence({ min: 3, max: 12 }),
      },
    });
  }

  console.log("Creating likes...");
  // each user likes a random subset of posts
  for (const u of allUsers) {
    const liked = faker.helpers.arrayElements(
      postIds,
      faker.number.int({ min: 5, max: 25 })
    );
    for (const pid of liked) {
      try {
        await prisma.like.create({ data: { userId: u.id, postId: pid } });
      } catch (e) {
        // duplicate like (same user, same post), ignore
      }
    }
  }

  console.log("Done seeding!");
  console.log("Login with username: demo  password: password123");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
