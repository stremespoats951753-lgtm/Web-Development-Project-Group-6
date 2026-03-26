/**
 * ============================================================
 * config.js — Central Configuration File for GamerFeed
 * ============================================================
 * 
 * This file stores all hardcoded values, constants, and default
 * settings used throughout the application. By centralising them
 * here, we avoid "magic strings" scattered across multiple files
 * and make maintenance much easier.
 * 
 * HOW TO USE:
 *   Include this script BEFORE any other JS file in every HTML page:
 *   <script src="../js/config.js"></script>
 * 
 * RESOURCES:
 *   - localStorage API: https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage
 *   - JSON.parse / stringify: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON
 *   - Template literals: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals
 *   - const keyword: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/const
 */

// ─── Application Identity ───────────────────────────────────
/** The display name of the application (shown in headers, titles, etc.) */
const APP_NAME = "GamerFeed";

/** The two-part brand text used in the logo */
const BRAND_FIRST = "GAMER";
const BRAND_SECOND = "FEED";

// ─── LocalStorage Keys ─────────────────────────────────────
/** 
 * The single key under which ALL app data (users, posts, session)
 * is stored as a JSON string in localStorage.
 * See: https://developer.mozilla.org/en-US/docs/Web/API/Storage/getItem
 */
const STORAGE_KEY = "gamerfeedData";

/**
 * Key used to persist the user's chosen theme ("light" or "dark").
 * Stored separately so the theme loads instantly before app data parses.
 */
const THEME_STORAGE_KEY = "gamerfeedTheme";

// ─── Default Values ─────────────────────────────────────────
/** Default bio assigned to newly-registered users */
const DEFAULT_BIO = "New gamer in the arena.";

/** Default game label shown on posts when the user doesn't specify one */
const DEFAULT_GAME = "Your Game";

/** Minimum username length required during registration */
const MIN_USERNAME_LENGTH = 3;

/** Minimum password length required during registration */
const MIN_PASSWORD_LENGTH = 6;

/** Maximum length of a post title */
const MAX_POST_TITLE_LENGTH = 100;

/** Maximum length of a user bio */
const MAX_BIO_LENGTH = 200;

/** Toast notification display duration in milliseconds */
const TOAST_DURATION_MS = 2800;

/** Redirect delay after successful login/register (ms) */
const REDIRECT_DELAY_MS = 800;

// ─── Navigation Labels ─────────────────────────────────────
/**
 * Labels used in the sidebar navigation.
 * Centralised here so they can be changed in one place.
 */
const NAV_LABELS = {
  FEED: "Feed",
  FOLLOWING: "Following",
  TRENDING: "Trending",
  ACHIEVEMENTS: "Achievements",
  DISCUSSION: "Discussion",
  MY_PROFILE: "My Profile",
  MY_ACHIEVEMENTS: "My Achievements",
  SAVED_POSTS: "Saved Posts",
  BROWSE_GAMES: "Browse Games"
};


/**
 * Filter mode constants for the feed.
 * "all" shows every post; "following" shows only posts from followed users.
 */
const FEED_MODES = {
  ALL: "all",
  FOLLOWING: "following"
};

// ─── Initial Data Structure ─────────────────────────────────
/**
 * Returns a fresh, empty app data object.
 * Used when localStorage has no data yet or when data is corrupted.
 * See: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object
 */
function getInitialAppData() {
  return {
    currentUserId: null,
    users: [],
    posts: []
  };
}

// ─── Post Type Constants ────────────────────────────────────
/** Valid post types and their display labels */
const POST_TYPES = {
  UPDATE: "update",
  ACHIEVEMENT: "achievement",
  DISCUSSION: "discussion"
};

const POST_TYPE_LABELS = {
  update: "UPDATE",
  achievement: "ACHIEVEMENT",
  discussion: "DISCUSSION"
};

/** Accent colours per post type (used in modals and badges) */
const POST_TYPE_COLORS = {
  update: "#00f5a0",
  achievement: "#f5a000",
  discussion: "#7a6fff"
};

// ─── Avatar Colour Mapping ──────────────────────────────────
/**
 * Maps avatar initials to a CSS class for colour.
 * See: https://developer.mozilla.org/en-US/docs/Web/CSS/color_value
 */
const AVATAR_COLOR_MAP = {
  NK: "gold",
  VX: "purple",
  SF: "red"
};

/** Default avatar colour class when no mapping exists */
const DEFAULT_AVATAR_CLASS = "green";

// ─── SVG ──────────────────────────────────────────────
/**
 * Inline SVG strings used throughout the UI.
 * Kept here so we can swap icons in one place.
 * Corresponding .svg files are in the /media/ folder.
 * 
 * SVG Reference: https://developer.mozilla.org/en-US/docs/Web/SVG
 * SVG <path>: https://developer.mozilla.org/en-US/docs/Web/SVG/Element/path
 * SVG <circle>: https://developer.mozilla.org/en-US/docs/Web/SVG/Element/circle
 * SVG <line>: https://developer.mozilla.org/en-US/docs/Web/SVG/Element/line
 */
const SVG_ICONS = {
  /** Heart icon for likes — see media/heart.svg */
  heart: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>`,

  /** Comment/chat bubble icon — see media/comment.svg */
  comment: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>`,

  /** Share icon — see media/share.svg */
  share: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>`,

  /** Bookmark/save icon — see media/bookmark.svg */
  bookmark: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>`,

  /** Trash/delete icon — see media/trash.svg */
  trash: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>`,

  /** Sun icon for light theme — see media/sun.svg */
  sun: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>`,

  /** Moon icon for dark theme — see media/moon.svg */
  moon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>`,

  /** Arrow right icon for "Read More" — see media/arrow-right.svg */
  arrowRight: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>`
};
// // One of the backfrounds will be chosen at random
// window.BACKGROUNDS = [
//   "../media/backgrounds/pattern.svg",
//   "../media/backgrounds/pattern-hex.svg",
//   "../media/backgrounds/pattern-star.svg"
// ];

// ─── Demo User Profiles ─────────────────────────────────────
/**
 * These fake user profiles let new users visit demo profiles
 * and follow demo users without needing to register them.
 * Centralised here so both index.js and profile.js share the
 * same data without duplication.
 * 
 * See: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object
 */
const DEMO_USERS = {
  demo_nightkira: {
    id: "demo_nightkira",
    username: "NightKira",
    email: "nightkira@gamerfeed.demo",
    bio: "Achievement hunter and soulslike grinder.",
    avatar: "NK",
    following: [],
    followers: []
  },
  demo_axelrift: {
    id: "demo_axelrift",
    username: "AxelRift",
    email: "axelrift@gamerfeed.demo",
    bio: "Patch-note addict and RPG fan.",
    avatar: "AX",
    following: [],
    followers: []
  },
  demo_voidx: {
    id: "demo_voidx",
    username: "VoidX",
    email: "voidx@gamerfeed.demo",
    bio: "Hot takes, long threads, zero regrets.",
    avatar: "VX",
    following: [],
    followers: []
  },
  demo_stormfang: {
    id: "demo_stormfang",
    username: "StormFang",
    email: "stormfang@gamerfeed.demo",
    bio: "Always answering the call for Super Earth.",
    avatar: "SF",
    following: [],
    followers: []
  }
};

// ─── Default / Seed Posts ───────────────────────────────────
/**
 * These posts appear for new users who have no data yet.
 * They simulate an active platform so the feed isn't empty.
 * 
 * NOTE: The "hasAchievement" and "achievementName" fields existed
 * previously for the achievement banner feature, which has been
 * REMOVED. They are kept as false/"" for backwards compatibility
 * in case old data in localStorage still references them.
 */
const DEFAULT_POSTS = [
  {
    id: 1,
    userId: "demo_nightkira",
    type: POST_TYPES.ACHIEVEMENT,
    username: "NightKira",
    avatarClass: "gold",
    avatarText: "NK",
    game: "Elden Ring",
    timestamp: "Mar 15, 2026 at 14:32",
    title: "Finally Got the Platinum!",
    content: "After 200+ hours, I finally got the Platinum Trophy for Elden Ring. The hardest part was the Malenia fight — took me 47 attempts. If anyone is struggling, focus on dodging the scarlet rot and learn her second phase timing. Worth every second.",
    likes: 284,
    liked: false,
    hasAchievement: false,
    achievementName: "",
    comments: [
      { id: 1, user: "AxelRift", avatarClass: "green", avatarText: "AX", text: "Congrats! Malenia is brutal. Did you use the bleed build?", time: "14:45", likes: 12 },
      { id: 2, user: "VoidX", avatarClass: "purple", avatarText: "VX", text: "Insane achievement. 47 attempts on Malenia means you were determined.", time: "15:01", likes: 8 }
    ]
  },
  {
    id: 2,
    userId: "demo_axelrift",
    type: POST_TYPES.UPDATE,
    username: "AxelRift",
    avatarClass: "green",
    avatarText: "AX",
    game: "Cyberpunk 2077",
    timestamp: "Mar 15, 2026 at 12:10",
    title: "New 2.5 Patch Changes Everything",
    content: "Just went through the new Cyberpunk 2077 patch 2.5 patch notes and this is genuinely exciting. The new vehicle combat system is completely revamped, crafting has been simplified, and there are 3 new gigs in Dogtown. Night City feels alive again.",
    likes: 142,
    liked: false,
    hasAchievement: false,
    achievementName: "",
    comments: [
      { id: 1, user: "StormFang", avatarClass: "red", avatarText: "SF", text: "The vehicle combat was so clunky before. Glad they finally fixed it.", time: "12:30", likes: 5 }
    ]
  },
  {
    id: 3,
    userId: "demo_voidx",
    type: POST_TYPES.DISCUSSION,
    username: "VoidX",
    avatarClass: "purple",
    avatarText: "VX",
    game: "General",
    timestamp: "Mar 15, 2026 at 09:55",
    title: "Are Live Service Games Killing Single Player?",
    content: "Hot take: The massive success of Elden Ring, BG3, and Astro Bot proves that gamers WANT well-crafted single player experiences. Yet every major publisher keeps throwing money at live service titles that fail within 6 months. When will the industry learn?\n\nDropping your thoughts below.",
    likes: 391,
    liked: false,
    hasAchievement: false,
    achievementName: "",
    comments: [
      { id: 1, user: "NightKira", avatarClass: "gold", avatarText: "NK", text: "Completely agree. Players will pay full price for a great SP game.", time: "10:15", likes: 34 },
      { id: 2, user: "AxelRift", avatarClass: "green", avatarText: "AX", text: "Live service can work when done right (Deep Rock Galactic) but most studios chase trends not quality.", time: "10:42", likes: 21 },
      { id: 3, user: "StormFang", avatarClass: "red", avatarText: "SF", text: "Both can coexist. The problem is executives, not the format.", time: "11:03", likes: 18 }
    ]
  },
  {
    id: 4,
    userId: "demo_stormfang",
    type: POST_TYPES.UPDATE,
    username: "StormFang",
    avatarClass: "red",
    avatarText: "SF",
    game: "Helldivers 2",
    timestamp: "Mar 14, 2026 at 22:18",
    title: "Super Earth Under Attack — Major Order Active",
    content: "The new Major Order just dropped and it is intense. We need to liberate 5 planets in 48 hours to unlock the new Patriot Exosuit stratagem. Current success rate: 34%. We need every Helldiver on deck right now. FOR SUPER EARTH.",
    likes: 217,
    liked: false,
    hasAchievement: false,
    achievementName: "",
    comments: []
  }
];
