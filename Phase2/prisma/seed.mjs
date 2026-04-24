import { prisma } from "./prisma.js";
import bcrypt from "bcryptjs";

// Sample gaming-related content
const gamingPosts = [
  "Just finished Elden Ring! What an incredible journey. The boss fights were insane! 🎮",
  "Anyone else excited for the new Zelda game? Can't wait to explore Hyrule again!",
  "Streaming some Valorant tonight at 8 PM. Come hang out! 🔴",
  "Finally hit Diamond in League of Legends! The grind was real 💎",
  "Hot take: Indie games are carrying the industry right now",
  "Looking for a squad for the new COD season. Drop your tags below!",
  "Cyberpunk 2077 is actually amazing now after all the updates",
  "Just got the new PS5 controller. The haptic feedback is game-changing!",
  "Who else is hyped for E3 next month? What announcements are you hoping for?",
  "Marathon gaming session today. 12 hours of pure Minecraft building 🏗️",
  "Best RPG of all time? I'm going with Witcher 3. Fight me.",
  "The new Fortnite season is wild! Epic really outdid themselves",
  "Speedrunning Super Mario 64. Current PB is 1:42:56. Getting close!",
  "Anyone want to play Among Us tonight? Need a full lobby",
  "Just beat Dark Souls without dying. I am become god 😎",
  "Apex Legends new character is OP. Calling it now.",
  "Building my first gaming PC. Any tips for a first-timer?",
  "Horizon Forbidden West has the most beautiful graphics I've ever seen",
  "Free to play games are getting too predatory with microtransactions",
  "GTA 6 when? Rockstar please 🙏",
  "Started playing Stardew Valley. Send help, I can't stop farming 🚜",
  "Esports should be in the Olympics. Change my mind.",
  "Just discovered this hidden indie gem called Hollow Knight. Wow!",
  "Rage quit Counter-Strike after that last match. Tomorrow's another day 😤",
  "The storytelling in The Last of Us is unmatched",
  "Retro gaming night! Dusting off the N64 🕹️",
  "Which game has the best soundtrack? My vote: Undertale",
  "Co-op games recommendations? Looking for something to play with friends",
  "VR gaming is the future. Just tried Half-Life: Alyx and I'm blown away",
  "Mobile gaming is real gaming. There, I said it 📱"
];

const comments = [
  "This is so true!",
  "I completely agree!",
  "Great take!",
  "Interesting perspective",
  "I disagree but I respect your opinion",
  "Facts!",
  "This hits different",
  "Couldn't have said it better myself",
  "Same here!",
  "Been saying this for years",
  "Hot take but I love it",
  "This is the way",
  "Absolutely!",
  "Big mood",
  "This! 100%",
  "I'm weak 😂",
  "No cap",
  "Based",
  "W take",
  "Real talk"
];

const firstNames = [
  'Alex', 'Jordan', 'Casey', 'Morgan', 'Riley', 'Taylor', 'Jamie', 'Avery',
  'Quinn', 'Blake', 'Parker', 'Skyler', 'River', 'Phoenix', 'Sage', 'Dakota',
  'Hunter', 'Cameron', 'Rowan', 'Charlie', 'Drew', 'Finley', 'Kai', 'Logan',
  'Max', 'Sam', 'Ash', 'Elliot', 'Hayden', 'Jesse'
];

const lastNames = [
  'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis',
  'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson',
  'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin', 'Lee', 'Walker', 'Hall',
  'Allen', 'Young', 'King', 'Wright', 'Scott', 'Green', 'Baker'
];

const bios = [
  "Gamer | Streamer | Coffee addict ☕",
  "Professional noob 🎮",
  "Speedrunner | WR holder in nothing",
  "Just here for the loot",
  "Esports enthusiast | Casual player",
  "Living that gaming life 🕹️",
  "Part-time gamer, full-time procrastinator",
  "Your friendly neighborhood gamer",
  "Achievement hunter | Completionist",
  "Streaming when I feel like it",
  "Git gud or go home",
  "Indie game supporter",
  "Retro gaming collector",
  "FPS main | RPG enjoyer",
  "Competitive but mostly for fun"
];

// Helper function to get random element from array
function getRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

// Helper function to get random number in range
function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Helper function to get random date in past N days
function getRandomDate(daysAgo) {
  const now = new Date();
  const past = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
  const randomTime = past.getTime() + Math.random() * (now.getTime() - past.getTime());
  return new Date(randomTime);
}

async function main() {
  console.log('🌱 Starting database seed...');

  // Clear existing data
  console.log('🗑️  Clearing existing data...');
  await prisma.like.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.post.deleteMany();
  await prisma.follow.deleteMany();
  await prisma.user.deleteMany();

  // Create users
  console.log('👥 Creating users...');
  const users = [];
  const userCount = 30;

  for (let i = 0; i < userCount; i++) {
    const firstName = getRandom(firstNames);
    const lastName = getRandom(lastNames);
    const username = `${firstName.toLowerCase()}${getRandomInt(100, 999)}`;
    const hashedPassword = await bcrypt.hash('password123', 10);

    const user = await prisma.user.create({
      data: {
        username,
        email: `${username}@gamerfeed.com`,
        passwordHash: hashedPassword,
        firstName,
        lastName,
        bio: getRandom(bios),
        profilePicture: `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`,
        createdAt: getRandomDate(180) // Users created within last 6 months
      }
    });
    users.push(user);
  }

  console.log(`✅ Created ${users.length} users`);

  // Create demo account with known password
  const demoUser = await prisma.user.create({
    data: {
      username: 'demo_user',
      email: 'demo@gamerfeed.com',
      passwordHash: await bcrypt.hash('demo123', 10),
      firstName: 'Demo',
      lastName: 'User',
      bio: 'Demo account for testing 🎮',
      profilePicture: 'https://api.dicebear.com/7.x/avataaars/svg?seed=demo',
      createdAt: new Date()
    }
  });
  users.push(demoUser);

  console.log('✅ Created demo user (username: demo_user, password: demo123)');

  // Create follows (social graph)
  console.log('🔗 Creating follow relationships...');
  const followsToCreate = [];
  for (let i = 0; i < users.length; i++) {
    const followerCount = getRandomInt(3, 15);
    const selectedUsers = new Set();

    for (let j = 0; j < followerCount; j++) {
      let randomUser = getRandom(users);
      // Don't follow yourself or duplicate follows
      while (randomUser.id === users[i].id || selectedUsers.has(randomUser.id)) {
        randomUser = getRandom(users);
      }
      selectedUsers.add(randomUser.id);

      followsToCreate.push({
        followerId: users[i].id,
        followingId: randomUser.id,
        createdAt: getRandomDate(150)
      });
    }
  }

  await prisma.follow.createMany({
    data: followsToCreate
  });

  console.log(`✅ Created ${followsToCreate.length} follow relationships`);

  // Create posts
  console.log('📝 Creating posts...');
  const posts = [];
  const postsPerUser = getRandomInt(5, 15);

  for (const user of users) {
    const userPostCount = getRandomInt(3, postsPerUser);

    for (let i = 0; i < userPostCount; i++) {
      const post = await prisma.post.create({
        data: {
          content: getRandom(gamingPosts),
          authorId: user.id,
          imageUrl: Math.random() > 0.7 ? `https://picsum.photos/seed/${Date.now()}_${i}/800/600` : null,
          createdAt: getRandomDate(90) // Posts within last 3 months
        }
      });
      posts.push(post);
    }
  }

  console.log(`✅ Created ${posts.length} posts`);

  // Create retweets (some posts are retweets of other posts)
  console.log('🔄 Creating retweets...');
  const retweetCount = Math.floor(posts.length * 0.15); // 15% of posts are retweets
  const retweets = [];

  for (let i = 0; i < retweetCount; i++) {
    const originalPost = getRandom(posts);
    const retweeter = getRandom(users);

    // Don't retweet your own posts
    if (originalPost.authorId !== retweeter.id) {
      const retweet = await prisma.post.create({
        data: {
          content: originalPost.content,
          authorId: retweeter.id,
          originalPostId: originalPost.id,
          createdAt: new Date(originalPost.createdAt.getTime() + getRandomInt(1, 30) * 24 * 60 * 60 * 1000)
        }
      });
      retweets.push(retweet);
    }
  }

  console.log(`✅ Created ${retweets.length} retweets`);

  // Create comments
  console.log('💬 Creating comments...');
  const commentsToCreate = [];
  const avgCommentsPerPost = getRandomInt(2, 8);

  for (const post of posts) {
    const commentCount = getRandomInt(0, avgCommentsPerPost);

    for (let i = 0; i < commentCount; i++) {
      let commenter = getRandom(users);
      
      commentsToCreate.push({
        content: getRandom(comments),
        postId: post.id,
        authorId: commenter.id,
        createdAt: new Date(post.createdAt.getTime() + getRandomInt(1, 60) * 60 * 1000) // Comments after post creation
      });
    }
  }

  await prisma.comment.createMany({
    data: commentsToCreate
  });

  console.log(`✅ Created ${commentsToCreate.length} comments`);

  // Create likes
  console.log('❤️  Creating likes...');
  const likesToCreate = [];

  for (const post of posts) {
    const likeCount = getRandomInt(0, 25);
    const likedBy = new Set();

    for (let i = 0; i < likeCount; i++) {
      let liker = getRandom(users);
      
      // Ensure unique likes per post
      while (likedBy.has(liker.id)) {
        liker = getRandom(users);
      }
      likedBy.add(liker.id);

      likesToCreate.push({
        postId: post.id,
        userId: liker.id,
        createdAt: new Date(post.createdAt.getTime() + getRandomInt(1, 120) * 60 * 1000)
      });
    }
  }

  await prisma.like.createMany({
    data: likesToCreate
  });

  console.log(`✅ Created ${likesToCreate.length} likes`);

  // Print summary statistics
  console.log('\n📊 Database seeding completed!');
  console.log('════════════════════════════════');
  console.log(`👥 Users: ${users.length}`);
  console.log(`📝 Posts: ${posts.length + retweets.length} (${posts.length} original + ${retweets.length} retweets)`);
  console.log(`💬 Comments: ${commentsToCreate.length}`);
  console.log(`❤️  Likes: ${likesToCreate.length}`);
  console.log(`🔗 Follows: ${followsToCreate.length}`);
  console.log('════════════════════════════════');
  console.log('\n🎮 Demo Account:');
  console.log('   Username: demo_user');
  console.log('   Password: demo123');
  console.log('   Email: demo@gamerfeed.com');
  console.log('════════════════════════════════\n');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });