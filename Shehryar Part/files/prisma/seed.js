// prisma/seed.js  – GamerFeed database seeder
// Run: node prisma/seed.js   (after prisma db push)

const { PrismaClient } = require('@prisma/client');
const db = new PrismaClient();

async function main() {
  console.log('🌱 Seeding GamerFeed database...');

  // ── USERS ──────────────────────────────────────────────────
  const users = await Promise.all([
    db.user.upsert({ where: { username: 'DrMucahid' }, update: {}, create: { username: 'DrMucahid', displayName: 'Dr. Mucahid', avatarText: 'DMK', avatarColor: 'green',  xp: 48200 } }),
    db.user.upsert({ where: { username: 'NightKira'  }, update: {}, create: { username: 'NightKira',  displayName: 'Night Kira',  avatarText: 'NK',  avatarColor: 'gold',   xp: 41700 } }),
    db.user.upsert({ where: { username: 'VoidX'      }, update: {}, create: { username: 'VoidX',      displayName: 'Void X',      avatarText: 'VX',  avatarColor: 'purple', xp: 38100 } }),
    db.user.upsert({ where: { username: 'StormFang'  }, update: {}, create: { username: 'StormFang',  displayName: 'Storm Fang',  avatarText: 'SF',  avatarColor: 'red',    xp: 29900 } }),
    db.user.upsert({ where: { username: 'AxelRift'   }, update: {}, create: { username: 'AxelRift',   displayName: 'Axel Rift',   avatarText: 'AX',  avatarColor: 'green',  xp: 22400 } }),
    db.user.upsert({ where: { username: 'LunaCore'   }, update: {}, create: { username: 'LunaCore',   displayName: 'Luna Core',   avatarText: 'LC',  avatarColor: 'purple', xp: 19800 } }),
    db.user.upsert({ where: { username: 'CryptoHawk' }, update: {}, create: { username: 'CryptoHawk', displayName: 'Crypto Hawk', avatarText: 'CH',  avatarColor: 'gold',   xp: 17300 } }),
    db.user.upsert({ where: { username: 'IronBlaze'  }, update: {}, create: { username: 'IronBlaze',  displayName: 'Iron Blaze',  avatarText: 'IB',  avatarColor: 'red',    xp: 14500 } }),
    db.user.upsert({ where: { username: 'PixelDusk'  }, update: {}, create: { username: 'PixelDusk',  displayName: 'Pixel Dusk',  avatarText: 'PD',  avatarColor: 'green',  xp: 11200 } }),
    db.user.upsert({ where: { username: 'ZephyrAce'  }, update: {}, create: { username: 'ZephyrAce',  displayName: 'Zephyr Ace',  avatarText: 'ZA',  avatarColor: 'gold',   xp: 9800  } }),
  ]);

  const [drm, nk, vx, sf, ax, lc, ch, ib, pd, za] = users;
  console.log(`  ✓ ${users.length} users`);

  // ── POSTS ──────────────────────────────────────────────────
  const postsData = [
    {
      authorId: nk.id, type: 'achievement', game: 'Elden Ring',
      title: 'Finally Got the Platinum!',
      content: 'After 200+ hours, I finally got the Platinum Trophy for Elden Ring. The hardest part was the Malenia fight — took me 47 attempts. If anyone is struggling, focus on dodging the scarlet rot and learn her second phase timing. Worth every second.',
      hasAchievement: true, achievementName: 'Elden Ring Platinum',
      createdAt: new Date('2026-03-15T14:32:00'),
    },
    {
      authorId: ax.id, type: 'update', game: 'Cyberpunk 2077',
      title: 'New 2.5 Patch Changes Everything',
      content: 'Just went through the new Cyberpunk 2077 patch 2.5 patch notes and this is genuinely exciting. The new vehicle combat system is completely revamped, crafting has been simplified, and there are 3 new gigs in Dogtown. Night City feels alive again.',
      hasAchievement: false,
      createdAt: new Date('2026-03-15T12:10:00'),
    },
    {
      authorId: vx.id, type: 'discussion', game: 'General',
      title: 'Are Live Service Games Killing Single Player?',
      content: 'Hot take: The massive success of Elden Ring, BG3, and Astro Bot proves that gamers WANT well-crafted single player experiences. Yet every major publisher keeps throwing money at live service titles that fail within 6 months. When will the industry learn?\n\nDropping your thoughts below.',
      hasAchievement: false,
      createdAt: new Date('2026-03-15T09:55:00'),
    },
    {
      authorId: sf.id, type: 'update', game: 'Helldivers 2',
      title: 'Super Earth Under Attack — Major Order Active',
      content: 'The new Major Order just dropped and it is intense. We need to liberate 5 planets in 48 hours to unlock the new Patriot Exosuit stratagem. Current success rate: 34%. We need every Helldiver on deck right now. FOR SUPER EARTH.',
      hasAchievement: false,
      createdAt: new Date('2026-03-14T22:18:00'),
    },
    {
      authorId: drm.id, type: 'achievement', game: 'Baldur\'s Gate 3',
      title: 'Honor Mode — First Try Win!',
      content: 'I cannot believe I just cleared Honor Mode on my first attempt. No reloads, no cheese, pure strategy. The final Raphael fight nearly ended it all but I managed to isolate him with a Wall of Force while the team burned him down.\n\nHonor Mode tips: always have a cleric, abuse high ground, and never split the party in Act 3.',
      hasAchievement: true, achievementName: 'Honour Among Thieves',
      createdAt: new Date('2026-03-14T18:45:00'),
    },
    {
      authorId: lc.id, type: 'discussion', game: 'General',
      title: 'Best Indie Games of 2026 So Far?',
      content: 'We are three months into 2026 and the indie scene is already delivering. Personally loving what small studios are doing with procedural generation and narrative design. What have you all been playing? Drop your recommendations — I am always hungry for hidden gems.',
      hasAchievement: false,
      createdAt: new Date('2026-03-14T15:30:00'),
    },
    {
      authorId: ch.id, type: 'update', game: 'GTA VI',
      title: 'GTA VI PC Specs Just Dropped',
      content: 'Rockstar just revealed the minimum and recommended PC specs for GTA VI and… yeah. Minimum is RTX 3070 + Ryzen 7 5800X + 32GB RAM. Recommended is RTX 4080. This is going to be incredible visually but a lot of players will need upgrades. The NPC AI system alone requires dedicated VRAM apparently.',
      hasAchievement: false,
      createdAt: new Date('2026-03-14T11:00:00'),
    },
    {
      authorId: ib.id, type: 'achievement', game: 'Dark Souls 3',
      title: 'SL1 No Hit Run Complete',
      content: 'It is done. Soul Level 1, no hit run of Dark Souls 3 including all DLC. 6 months of practice, thousands of attempts. Sister Friede is legitimately the hardest boss in all of Soulsborne at SL1.\n\nShoutout to the community for the routing help. Never thought I would actually pull this off.',
      hasAchievement: true, achievementName: 'The Dark Soul',
      createdAt: new Date('2026-03-13T20:00:00'),
    },
    {
      authorId: pd.id, type: 'discussion', game: 'General',
      title: 'Controller vs Keyboard — the eternal debate',
      content: 'Playing my first PC exclusive after years on console and the adjustment is rough. Some games feel designed for KBM (RTS, shooters) but action-RPGs just feel wrong without a controller. Do PC gamers switch between them depending on game genre? Would love to hear your setups.',
      hasAchievement: false,
      createdAt: new Date('2026-03-13T16:22:00'),
    },
    {
      authorId: za.id, type: 'update', game: 'Monster Hunter Wilds',
      title: 'Title Update 2 Brings Back Fan Favourite',
      content: 'Title Update 2 for Monster Hunter Wilds officially brings back Zinogre and it looks INCREDIBLE in the new engine. Attack patterns are remixed, the new locale it inhabits has dynamic weather that changes the fight mid-hunt, and there\'s a layered armor set on completion. Hunt starts Friday.',
      hasAchievement: false,
      createdAt: new Date('2026-03-13T10:15:00'),
    },
    {
      authorId: nk.id, type: 'update', game: 'Elden Ring',
      title: 'Shadow of the Erdtree DLC — 80 Hour Review',
      content: 'Finished every corner of the DLC. Short verdict: FromSoftware has outdone themselves. The boss designs are the best in the series, the final area is visually breathtaking, and Messmer might be my new favourite FromSoft character. The difficulty spike is real but earned. Mandatory.',
      hasAchievement: false,
      createdAt: new Date('2026-03-12T22:00:00'),
    },
    {
      authorId: vx.id, type: 'achievement', game: 'Hades 2',
      title: '100 Heat Clear — Omega Build',
      content: 'Finally cracked the 100 Heat clear in Hades 2 using a full Omega Cast build with Poseidon and Demeter boons. The key is stacking cast speed and getting the Primordial Chaos boon that doubles Omega casts. Took 3 weeks of daily attempts.',
      hasAchievement: true, achievementName: 'Extreme Heat',
      createdAt: new Date('2026-03-12T19:30:00'),
    },
    {
      authorId: sf.id, type: 'discussion', game: 'General',
      title: 'Is Game Pass Actually Killing Game Sales?',
      content: 'New report out today claims Xbox Game Pass has reduced day-one sales by up to 40% for first-party titles. Some devs say this cannibilises revenue, others say it expands their audience. What do you think — is subscription gaming good for the industry long term or does it race to the bottom?',
      hasAchievement: false,
      createdAt: new Date('2026-03-12T14:00:00'),
    },
    {
      authorId: ax.id, type: 'update', game: 'Hollow Knight: Silksong',
      title: 'Silksong Direct — Finally a Release Window!',
      content: 'Team Cherry just dropped a 20 minute Silksong Direct and gave a Q3 2026 release window. The new mechanics look incredible — Hornet\'s combat is way more aggressive than the Knight and the new kingdom of Pharloom is visually unlike anything in the original. The wait is almost over.',
      hasAchievement: false,
      createdAt: new Date('2026-03-11T18:00:00'),
    },
    {
      authorId: lc.id, type: 'achievement', game: 'Celeste',
      title: 'All Strawberries + All B/C-Sides',
      content: 'Three years after first playing Celeste I finally collected every strawberry AND cleared all B-sides and C-sides. Chapter 9 C-side had me ready to give up twice. This game genuinely made me a better player and person. Cannot recommend it highly enough to anyone who enjoys precise platformers.',
      hasAchievement: true, achievementName: 'All Clear',
      createdAt: new Date('2026-03-11T12:45:00'),
    },
  ];

  const createdPosts = [];
  for (const p of postsData) {
    const post = await db.post.create({ data: p });
    createdPosts.push(post);
  }
  console.log(`  ✓ ${createdPosts.length} posts`);

  // helper: get post by 0-based index
  const P = (i) => createdPosts[i];

  // ── COMMENTS ───────────────────────────────────────────────
  const commentsData = [
    // Post 0 – Elden Ring Platinum
    { postId: P(0).id, authorId: ax.id,  text: 'Congrats! Malenia is brutal. Did you use the bleed build?',              createdAt: new Date('2026-03-15T14:45:00') },
    { postId: P(0).id, authorId: vx.id,  text: 'Insane achievement. 47 attempts on Malenia means you were determined.',  createdAt: new Date('2026-03-15T15:01:00') },
    { postId: P(0).id, authorId: drm.id, text: 'Rivers of Blood bleed build trivialises her phase 1. Phase 2 you still need to dodge the scarlet rot explosion carefully.',  createdAt: new Date('2026-03-15T15:20:00') },
    { postId: P(0).id, authorId: sf.id,  text: 'She is the only boss that genuinely made me put the controller down for a day.', createdAt: new Date('2026-03-15T16:00:00') },

    // Post 1 – Cyberpunk patch
    { postId: P(1).id, authorId: sf.id,  text: 'The vehicle combat was so clunky before. Glad they finally fixed it.',   createdAt: new Date('2026-03-15T12:30:00') },
    { postId: P(1).id, authorId: nk.id,  text: 'Those Dogtown gigs sound amazing — is one of them connected to the main story?', createdAt: new Date('2026-03-15T13:00:00') },
    { postId: P(1).id, authorId: lc.id,  text: 'CDPR keeps delivering post launch. This is how you treat players.',        createdAt: new Date('2026-03-15T13:45:00') },

    // Post 2 – Live service debate
    { postId: P(2).id, authorId: nk.id,  text: 'Completely agree. Players will pay full price for a great single player game every single time.', createdAt: new Date('2026-03-15T10:15:00') },
    { postId: P(2).id, authorId: ax.id,  text: 'Live service can work when done right (Deep Rock Galactic) but most studios chase trends not quality.', createdAt: new Date('2026-03-15T10:42:00') },
    { postId: P(2).id, authorId: sf.id,  text: 'Both can coexist. The problem is executives, not the format.',            createdAt: new Date('2026-03-15T11:03:00') },
    { postId: P(2).id, authorId: drm.id, text: 'The issue is shareholders want recurring revenue. The incentives are structurally broken.',  createdAt: new Date('2026-03-15T11:30:00') },
    { postId: P(2).id, authorId: lc.id,  text: 'BG3 sold 10 million copies with zero live service. Just make a great game.',  createdAt: new Date('2026-03-15T12:00:00') },

    // Post 3 – Helldivers
    { postId: P(3).id, authorId: nk.id,  text: 'Already on it. We pushed the first planet to 72% liberation overnight!',  createdAt: new Date('2026-03-14T22:45:00') },
    { postId: P(3).id, authorId: ax.id,  text: 'FOR SUPER EARTH! Jumped in with my squad immediately after reading this.', createdAt: new Date('2026-03-14T23:00:00') },
    { postId: P(3).id, authorId: lc.id,  text: 'The community coordination in this game is unparalleled. Love it.',        createdAt: new Date('2026-03-15T00:10:00') },

    // Post 4 – BG3 Honor Mode
    { postId: P(4).id, authorId: nk.id,  text: 'First try Honor Mode is WILD. I failed on my 4th attempt and thought that was impressive.', createdAt: new Date('2026-03-14T19:10:00') },
    { postId: P(4).id, authorId: vx.id,  text: 'Wall of Force against Raphael is so elegant. Pure big brain gaming.',     createdAt: new Date('2026-03-14T19:35:00') },
    { postId: P(4).id, authorId: sf.id,  text: 'I lost my honor mode run to a random trap in Act 2. Devastated. You give me hope.', createdAt: new Date('2026-03-14T20:00:00') },

    // Post 5 – Indie games
    { postId: P(5).id, authorId: pd.id,  text: 'Animal Well and Balatro are my two standouts already. Completely different vibes but both masterpieces.', createdAt: new Date('2026-03-14T16:00:00') },
    { postId: P(5).id, authorId: za.id,  text: 'Keep an eye on Lorn\'s Lure — incredible atmosphere and the climbing system is super tactile.', createdAt: new Date('2026-03-14T16:45:00') },
    { postId: P(5).id, authorId: ch.id,  text: 'Caves of Qud has consumed me. Insanely deep if you can get past the learning curve.', createdAt: new Date('2026-03-14T17:20:00') },

    // Post 6 – GTA VI specs
    { postId: P(6).id, authorId: ib.id,  text: 'Those specs are terrifying. Minimum is better than my current system.',   createdAt: new Date('2026-03-14T11:30:00') },
    { postId: P(6).id, authorId: pd.id,  text: 'PC gaming tax incoming. Time to save up for a new GPU.',                   createdAt: new Date('2026-03-14T12:00:00') },
    { postId: P(6).id, authorId: vx.id,  text: 'If the NPC AI is actually next gen this will redefine open world games.',  createdAt: new Date('2026-03-14T12:30:00') },

    // Post 7 – DS3 SL1 No Hit
    { postId: P(7).id, authorId: drm.id, text: 'This is the most impressive gaming achievement I have ever read. Absolute legend.', createdAt: new Date('2026-03-13T20:30:00') },
    { postId: P(7).id, authorId: nk.id,  text: 'SL1 alone is grueling. SL1 no hit is another dimension of pain entirely.', createdAt: new Date('2026-03-13T21:00:00') },
    { postId: P(7).id, authorId: vx.id,  text: 'Sister Friede no hit at SL1 might be the hardest thing in gaming, period.', createdAt: new Date('2026-03-13T21:30:00') },

    // Post 8 – Controller vs KBM
    { postId: P(8).id, authorId: ax.id,  text: 'Yes, I swap all the time. Controller for action games and third person, KBM for everything else.', createdAt: new Date('2026-03-13T17:00:00') },
    { postId: P(8).id, authorId: ch.id,  text: 'Steam Input makes this seamless. Just configure per-game and forget about it.', createdAt: new Date('2026-03-13T17:30:00') },
    { postId: P(8).id, authorId: za.id,  text: 'I use an Xbox controller for literally everything including strategy games. Controversial I know.', createdAt: new Date('2026-03-13T18:00:00') },

    // Post 9 – MH Wilds TU2
    { postId: P(9).id, authorId: drm.id, text: 'Zinogre is my favourite monster. The Wilds version looks absolutely stunning.',  createdAt: new Date('2026-03-13T10:45:00') },
    { postId: P(9).id, authorId: lc.id,  text: 'Dynamic weather during the fight is such a clever mechanic. Cannot wait.',   createdAt: new Date('2026-03-13T11:15:00') },

    // Post 12 – Game Pass debate
    { postId: P(12).id, authorId: nk.id,  text: 'Game Pass is amazing as a player but I worry about the developer economics long term.', createdAt: new Date('2026-03-12T14:30:00') },
    { postId: P(12).id, authorId: ax.id,  text: 'Helldivers 2 was NOT on Game Pass and sold 12 million copies. Quality wins.',  createdAt: new Date('2026-03-12T15:00:00') },
    { postId: P(12).id, authorId: lc.id,  text: 'It depends entirely on the deal terms between the studio and Microsoft.',     createdAt: new Date('2026-03-12T15:30:00') },

    // Post 14 – Celeste all strawberries
    { postId: P(14).id, authorId: pd.id,  text: 'Chapter 9 C-side might be the hardest thing in mainstream gaming. You are a hero.', createdAt: new Date('2026-03-11T13:15:00') },
    { postId: P(14).id, authorId: za.id,  text: 'Celeste is a masterpiece. The game secretly being about mental health made the difficulty feel meaningful.', createdAt: new Date('2026-03-11T14:00:00') },
    { postId: P(14).id, authorId: ib.id,  text: 'I had to look up assists for chapter 9. No shame — that game is brutal at the top end.', createdAt: new Date('2026-03-11T14:30:00') },
  ];

  const createdComments = [];
  for (const c of commentsData) {
    const comment = await db.comment.create({ data: c });
    createdComments.push(comment);
  }
  console.log(`  ✓ ${createdComments.length} comments`);

  // ── LIKES (post likes) ─────────────────────────────────────
  const postLikeSeeds = [
    // Post 0 – Elden Ring Platinum (high likes)
    ...[drm, vx, sf, ax, lc, ch, ib, pd, za].map(u => ({ userId: u.id, postId: P(0).id })),
    // Post 1 – Cyberpunk patch
    ...[drm, nk, vx, sf, lc, ch].map(u => ({ userId: u.id, postId: P(1).id })),
    // Post 2 – Live service discussion
    ...[drm, nk, ax, sf, lc, ch, ib, pd, za].map(u => ({ userId: u.id, postId: P(2).id })),
    // Post 3 – Helldivers
    ...[nk, vx, lc, ch, ib, pd].map(u => ({ userId: u.id, postId: P(3).id })),
    // Post 4 – BG3 Honor Mode
    ...[nk, vx, sf, ax, lc, ch, ib, pd, za].map(u => ({ userId: u.id, postId: P(4).id })),
    // Post 5 – Indie games
    ...[drm, nk, vx, sf, ax, ch].map(u => ({ userId: u.id, postId: P(5).id })),
    // Post 6 – GTA VI specs
    ...[nk, vx, ax, lc, ib, pd, za].map(u => ({ userId: u.id, postId: P(6).id })),
    // Post 7 – DS3 SL1
    ...[drm, nk, vx, ax, lc, ch, ib, pd].map(u => ({ userId: u.id, postId: P(7).id })),
    // Post 8 – Controller debate
    ...[nk, vx, sf, lc, ch, ib].map(u => ({ userId: u.id, postId: P(8).id })),
    // Post 9 – MH Wilds TU2
    ...[nk, vx, sf, ax, ch, ib, pd].map(u => ({ userId: u.id, postId: P(9).id })),
    // Post 10 – Elden Ring DLC review
    ...[drm, vx, sf, ax, lc, ch, ib].map(u => ({ userId: u.id, postId: P(10).id })),
    // Post 11 – Hades 2 100 heat
    ...[drm, nk, sf, ax, lc, ch, pd].map(u => ({ userId: u.id, postId: P(11).id })),
    // Post 12 – Game pass
    ...[drm, vx, sf, ax, ib, pd, za].map(u => ({ userId: u.id, postId: P(12).id })),
    // Post 13 – Silksong
    ...[drm, nk, vx, sf, ax, lc, ib, pd, za].map(u => ({ userId: u.id, postId: P(13).id })),
    // Post 14 – Celeste all clear
    ...[drm, nk, vx, sf, ax, lc, ch, ib].map(u => ({ userId: u.id, postId: P(14).id })),
  ];

  let likeCount = 0;
  for (const like of postLikeSeeds) {
    await db.like.create({ data: like }).catch(() => {}); // skip dupes
    likeCount++;
  }

  // Comment likes
  const commentLikeSeeds = [
    { userId: nk.id,  commentId: createdComments[0].id },
    { userId: drm.id, commentId: createdComments[0].id },
    { userId: sf.id,  commentId: createdComments[1].id },
    { userId: ax.id,  commentId: createdComments[7].id },
    { userId: vx.id,  commentId: createdComments[7].id },
    { userId: drm.id, commentId: createdComments[7].id },
    { userId: lc.id,  commentId: createdComments[8].id },
    { userId: nk.id,  commentId: createdComments[8].id },
    { userId: ax.id,  commentId: createdComments[9].id },
    { userId: drm.id, commentId: createdComments[9].id },
  ];

  for (const like of commentLikeSeeds) {
    await db.like.create({ data: like }).catch(() => {});
    likeCount++;
  }

  console.log(`  ✓ ${likeCount} likes`);
  console.log('✅ Seed complete!');
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => db.$disconnect());
