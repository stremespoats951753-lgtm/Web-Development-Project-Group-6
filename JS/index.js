/**
 * ============================================================
 * index.js — Main Feed Logic for GamerFeed
 * ============================================================
 * 
 * This is the largest script in the project. It manages:
 *   - Loading and displaying posts in the news feed.
 *   - Creating and deleting posts.
 *   - Liking posts.
 *   - Commenting on posts (via a modal).
 *   - Filtering posts by type (all / update / achievement / discussion).
 *   - Filtering by feed mode: "all" (every post) vs "following" (only
 *     posts from followed users + own posts).
 *   - Navigating to user profiles.
 * 
 * POST DISPLAY LOGIC — FEED vs MODAL vs PROFILE:
 * ────────────────────────────────────────────────
 * • FEED (this page): Post content is TRUNCATED to ~3 lines
 *   using CSS (max-height on .card-content). This keeps the
 *   timeline scannable. A "READ MORE →" link opens the modal.
 *   See: https://developer.mozilla.org/en-US/docs/Web/CSS/max-height
 * 
 * • MODAL (on this page): Shows the FULL post content with
 *   no truncation (the .modal-text class has no max-height).
 *   Also displays all comments and allows interaction.
 *   See: https://developer.mozilla.org/en-US/docs/Web/CSS/overflow
 * 
 * • PROFILE PAGE (profile.html / profile.js): Uses the SAME
 *   card structure as the feed, with truncation and full
 *   like/comment/delete functionality via an identical modal.
 * 
 * FEED MODES:
 * ───────────
 * • FEED_MODES.ALL ("all"): Shows ALL posts regardless of follow status.
 * • FEED_MODES.FOLLOWING ("following"): Shows only posts from users
 *   the current user follows, plus the user's own posts.
 * 
 * DEPENDENCIES:
 *   - config.js (STORAGE_KEY, POST_TYPE_LABELS, SVG_ICONS, DEMO_USERS,
 *     DEFAULT_POSTS, FEED_MODES, NAV_LABELS, etc.)
 *   - theme.js (handles theme toggle)
 * 
 * RESOURCES:
 *   - DOM manipulation: https://developer.mozilla.org/en-US/docs/Web/API/Document/getElementById
 *   - createElement: https://developer.mozilla.org/en-US/docs/Web/API/Document/createElement
 *   - innerHTML: https://developer.mozilla.org/en-US/docs/Web/API/Element/innerHTML
 *   - addEventListener: https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener
 *   - Array.prototype.filter: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/filter
 *   - Array.prototype.find: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/find
 *   - localStorage: https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage
 *   - JSON: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON
 *   - URLSearchParams: https://developer.mozilla.org/en-US/docs/Web/API/URLSearchParams
 *   - Date: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date
 * ============================================================
 */

/* ── State Variables ─────────────────────────────────────── */

/** Current filter type for the feed ("all", "update", etc.) */
let currentFilter = "all";

/**
 * Current feed mode — controls whether we show all posts or only
 * posts from followed users. Uses FEED_MODES from config.js.
 * See: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/let
 */
let currentFeedMode = FEED_MODES.ALL;

/** Currently selected post type in the create-post form */
let selectedType = POST_TYPES.UPDATE;

/** ID of the post currently shown in the modal (null if closed) */
let currentModalPostId = null;

/** In-memory array of all posts (synced to localStorage) */
let feedPosts = [];

/** Counter used to generate unique IDs for new posts */
let postIdCounter = 100;

/* ══════════════════════════════════════════════════════════
   DATA ACCESS FUNCTIONS
   ══════════════════════════════════════════════════════════ */

/**
 * Look up a demo user by their ID. Returns null if not found.
 * Demo users are defined in config.js (DEMO_USERS constant).
 */
function getDemoUser(userId) {
  return DEMO_USERS[userId] || null;
}

/**
 * Find any user — first checks real users in localStorage,
 * then falls back to demo users.
 * See: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Logical_OR
 */
function getAnyUserById(data, userId) {
  return getUserById(data, userId) || getDemoUser(userId);
}

/**
 * Returns the following array for a user, or empty array.
 * See: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/isArray
 */
function getFollowingList(user) {
  return Array.isArray(user?.following) ? user.following : [];
}

/**
 * Determines if a post should appear when filtering by "following".
 * A post is visible if it was made by someone the user follows.
 */
function isVisibleInFollowingFeed(post, currentUser) {
  if (!currentUser) return false;
  const following = getFollowingList(currentUser);
  // return post.userId === currentUser.id || following.includes(post.userId);
  return following.includes(post.userId);
}

/** Navigate to a user's profile page. */
function openUserProfile(userId) {
  if (!userId) return;
  window.location.href = `profile.html?user=${encodeURIComponent(userId)}`;
}

/**
 * Retrieves the full app data from localStorage.
 * If missing or corrupt, initialises with empty data.
 * See: https://developer.mozilla.org/en-US/docs/Web/API/Storage/getItem
 */
function getAppData() {
  const rawData = localStorage.getItem(STORAGE_KEY);

  if (!rawData) {
    const initialData = getInitialAppData();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(initialData));
    return initialData;
  }

  try {
    return JSON.parse(rawData);
  } catch (error) {
    console.error("Failed to parse localStorage data:", error);
    const fallbackData = getInitialAppData();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(fallbackData));
    return fallbackData;
  }
}

/** Saves the full app data object to localStorage. */
function saveAppData(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

/** Finds the currently logged-in user from the data. */
function getCurrentUser(data) {
  return data.users.find(user => user.id === data.currentUserId) || null;
}

/** Finds a real (non-demo) user by ID. */
function getUserById(data, userId) {
  return data.users.find(user => user.id === userId) || null;
}

/* ══════════════════════════════════════════════════════════
   FORMATTING & NORMALISATION
   ══════════════════════════════════════════════════════════ */

/**
 * Formats a timestamp value into a human-readable string.
 * See: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/toLocaleString
 */
function formatTimestamp(value) {
  if (!value) return "";
  if (typeof value === "string" && value.includes(" at ")) return value;

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);

  return date.toLocaleString("en-US", {
    month: "short", day: "numeric", year: "numeric",
    hour: "2-digit", minute: "2-digit"
  });
}

/**
 * Maps avatar text to a CSS colour class.
 * Uses AVATAR_COLOR_MAP from config.js.
 */
function getAvatarClassFromText(text) {
  const value = String(text || "").toUpperCase();
  return AVATAR_COLOR_MAP[value] || DEFAULT_AVATAR_CLASS;
}

/**
 * Ensures a comment object has all required fields with
 * sensible defaults (defensive programming).
 * See: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Logical_OR
 */
function normalizeComment(comment, fallbackUser) {
  return {
    id: comment.id || Date.now(),
    user: comment.user || fallbackUser || "Unknown User",
    avatarClass: comment.avatarClass || DEFAULT_AVATAR_CLASS,
    avatarText: comment.avatarText || "??",
    text: comment.text || "",
    time: comment.time || "",
    likes: typeof comment.likes === "number" ? comment.likes : 0
  };
}

/**
 * Normalises a post object to ensure all fields exist.
 * This is important because posts from localStorage may be
 * missing fields if the data schema was updated.
 * See: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Spread_syntax
 */
function normalizePost(post, data) {
  const linkedUser = post.userId ? getUserById(data, post.userId) : null;

  const username = post.username || linkedUser?.username || "Unknown User";
  const avatarText = post.avatarText || post.avatar || linkedUser?.avatar ||
    (username ? username.slice(0, 2).toUpperCase() : "??");
  const avatarClass = post.avatarClass || getAvatarClassFromText(avatarText);

  /* Ensure type is one of the valid values */
  const type = [POST_TYPES.UPDATE, POST_TYPES.ACHIEVEMENT, POST_TYPES.DISCUSSION].includes(post.type)
    ? post.type : POST_TYPES.UPDATE;

  /* Likes can be a number or (legacy) an array of user IDs */
  const rawLikes = post.likes;
  const likes = typeof rawLikes === "number" ? rawLikes
    : Array.isArray(rawLikes) ? rawLikes.length : 0;

  const comments = Array.isArray(post.comments)
    ? post.comments.map(c => normalizeComment(c, username)) : [];

  const title = post.title || "Untitled Post";

  return {
    id: post.id,
    userId: post.userId || null,
    type, username, avatarClass, avatarText,
    game: post.game || DEFAULT_GAME,
    timestamp: formatTimestamp(post.timestamp),
    title,
    content: post.content || "",
    likes,
    liked: typeof post.liked === "boolean" ? post.liked : false,
    hasAchievement: false,
    achievementName: "",
    comments
  };
}

/** Navigate to the logged-in user's own profile. */
function openMyProfile() {
  const data = getAppData();
  const currentUser = getCurrentUser(data);
  if (!currentUser) return;
  window.location.href = `../HTML/profile.html?user=${encodeURIComponent(currentUser.id)}`;
}

/** Normalise all posts in an array. */
function normalizeAllPosts(posts, data) {
  return posts.map(post => normalizePost(post, data));
}

/** Persist the in-memory feedPosts array to localStorage. */
function syncPostsToStorage() {
  const data = getAppData();
  data.posts = feedPosts;
  saveAppData(data);
}

/* ══════════════════════════════════════════════════════════
   INITIALISATION
   ══════════════════════════════════════════════════════════ */

/**
 * init() runs on page load. It:
 *   1. Checks if the user is logged in (redirects to login if not).
 *   2. Loads posts from localStorage or falls back to demo data.
 *   3. Sets up the avatar display and logout button.
 *   4. Renders the feed for the first time.
 * 
 * See: https://developer.mozilla.org/en-US/docs/Web/API/Window/location
 */
function init() {
  const data = getAppData();
  const currentUser = getCurrentUser(data);

  /* Redirect to login if no session */
  if (!currentUser) {
    window.location.href = "auth.html";
    return;
  }

  /* Load posts: use stored data or fall back to demo posts from config.js */
  if (Array.isArray(data.posts) && data.posts.length > 0) {
    feedPosts = normalizeAllPosts(data.posts, data);
  } else {
    feedPosts = [...DEFAULT_POSTS];
    data.posts = [...DEFAULT_POSTS];
    saveAppData(data);
  }

  /* Set the post ID counter above the max existing ID to avoid collisions */
  const maxId = feedPosts.reduce((max, post) => Math.max(max, Number(post.id) || 0), 0);
  postIdCounter = Math.max(100, maxId);

  /* Update the header and create-post avatars with the current user's initials */
  const currentAvatar = currentUser.avatar || currentUser.username.slice(0, 2).toUpperCase();
  const avatarChip = document.querySelector(".avatar-chip");
  const postAvatar = document.querySelector(".post-avatar");
  if (avatarChip) avatarChip.textContent = currentAvatar;
  if (postAvatar) postAvatar.textContent = currentAvatar;

  bindLogout();
  renderFeed();
}

/** Attaches the logout click handler. */
function bindLogout() {
  const logoutBtn = document.getElementById("logoutBtn");
  if (!logoutBtn) return;

  logoutBtn.addEventListener("click", function () {
    const data = getAppData();
    data.currentUserId = null;   /* Clear the session */
    saveAppData(data);
    window.location.href = "auth.html";
  });
}

/* ══════════════════════════════════════════════════════════
   FEED RENDERING
   ══════════════════════════════════════════════════════════ */

/**
 * Renders the post feed.
 * 
 * FEED MODES (new):
 *   - FEED_MODES.ALL ("all") → show ALL posts (no follow filtering).
 *   - FEED_MODES.FOLLOWING ("following") → show only posts from
 *     followed users + the user's own posts.
 * 
 * Then the type filter (all/update/achievement/discussion) is
 * applied on top.
 * 
 * See: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/filter
 */
function renderFeed() {
  const data = getAppData();
  const currentUser = getCurrentUser(data);
  const container = document.getElementById("feed-container");
  container.innerHTML = "";

  if (!currentUser) {
    container.innerHTML = '<div style="text-align:center;padding:40px;color:#555;">You must be logged in.</div>';
    return;
  }

  let posts;

  /*
   * Feed mode filtering:
   * - "all" → show every post
   * - "following" → show only posts from followed users + own posts
   */
  if (currentFeedMode === FEED_MODES.FOLLOWING) {
    posts = feedPosts.filter(post => isVisibleInFollowingFeed(post, currentUser));
  } else {
    posts = [...feedPosts];
  }

  /* Apply type filter if not "all" */
  if (currentFilter !== "all") {
    posts = posts.filter(post => post.type === currentFilter);
  }

  if (posts.length === 0) {
    container.innerHTML = '<div style="text-align:center;padding:40px;color:#555;">No posts found.</div>';
    return;
  }

  /* Build and append a card DOM element for each post */
  posts.forEach(post => container.appendChild(buildCard(post)));
}



/* ══════════════════════════════════════════════════════════
   POST CARD BUILDER
   ══════════════════════════════════════════════════════════ */

/**
 * Builds a single post card element for the feed.
 * 
 * NOTE: The card uses CSS max-height on .card-content to
 * TRUNCATE long posts to ~3 lines. The full content is only
 * visible when the user opens the post modal.
 * See: https://developer.mozilla.org/en-US/docs/Web/CSS/max-height
 * See: https://developer.mozilla.org/en-US/docs/Web/CSS/overflow
 * 
 * The card includes:
 *   - Author avatar and username (clickable → profile)
 *   - Post type badge
 *   - Like button (with SVG heart icon from config.js / media/heart.svg)
 *   - Comment count
 *   - Delete button (only on the user's own posts)
 *   - "READ MORE →" link to open the modal
 * 
 * NOTE: The achievement banner feature has been REMOVED.
 * Posts no longer display the "ACHIEVEMENT UNLOCKED" banner.
 */
function buildCard(post) {
  const card = document.createElement("article");
  card.className = `post-card ${post.type}`;
  card.onclick = () => openModal(post.id);

  const data = getAppData();
  const currentUser = getCurrentUser(data);
  const isOwnPost = currentUser && post.userId === currentUser.id;

  card.innerHTML = `
    <div class="card-body">
      <div class="card-meta">
        <div class="av ${post.avatarClass}">${post.avatarText}</div>
        <div>
          <div class="card-username">
            <span onclick="event.stopPropagation(); openUserProfile('${post.userId}')">${post.username}</span>
            <span class="game-tag">${post.game}</span>
          </div>
          <div class="card-timestamp">${post.timestamp}</div>
        </div>
        <span class="type-badge">${POST_TYPE_LABELS[post.type]}</span>
      </div>
      <div class="card-title">${post.title}</div>
      <div class="card-content">${post.content}</div>
    </div>
    <div class="card-actions" onclick="event.stopPropagation()">
      <button class="action-btn ${post.liked ? "liked" : ""}" onclick="toggleLike(${post.id})">
        ${SVG_ICONS.heart} ${post.likes}
      </button>
      <button class="action-btn" onclick="openModal(${post.id})">
        ${SVG_ICONS.comment} ${post.comments.length}
      </button>
      ${isOwnPost ? `<button class="action-btn delete-btn" onclick="deletePost(${post.id})">${SVG_ICONS.trash} Delete</button>` : ""}
      <span class="read-more" onclick="openModal(${post.id})">READ MORE ${SVG_ICONS.arrowRight}</span>
    </div>`;

  return card;
}

/* ══════════════════════════════════════════════════════════
   POST INTERACTIONS
   ══════════════════════════════════════════════════════════ */

/**
 * Toggles the like status on a post.
 * If already liked → unlike (decrement count).
 * If not liked → like (increment count).
 * See: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/max
 */
function toggleLike(postId) {
  const post = feedPosts.find(p => p.id === postId);
  if (!post) return;

  if (post.liked === true) {
    post.liked = false;
    post.likes = Math.max(0, post.likes - 1);
  } else {
    post.liked = true;
    post.likes = post.likes + 1;
  }

  syncPostsToStorage();
  renderFeed();

  /* If the modal is open for this post, update it too */
  if (currentModalPostId === postId) {
    populateModal(post);
  }
}

/**
 * Changes the feed type filter and re-renders.
 * See: https://developer.mozilla.org/en-US/docs/Web/API/Element/classList
 */
function setFilter(filter, el) {
  currentFilter = filter;
  document.querySelectorAll(".feed-filter").forEach(f => f.classList.remove("active"));
  if (el && el.classList) el.classList.add("active");
  renderFeed();
}

/**
 * Switches the feed mode between "all" and "following".
 * Updates the active state on the sidebar nav items.
 * 
 * @param {string} mode — One of FEED_MODES.ALL or FEED_MODES.FOLLOWING
 * @param {HTMLElement} el — The clicked nav item element
 */
function setFeedMode(mode, el) {
  currentFeedMode = mode;

  /* Update sidebar nav active states */
  document.querySelectorAll(".sidebar-left .nav-item").forEach(item => {
    item.classList.remove("active");
  });
  if (el) el.classList.add("active");

  renderFeed();
}

/** Selects a post type in the create-post form. */
function selectType(type, el) {
  selectedType = type;
  document.querySelectorAll(".type-chip").forEach(c => c.classList.remove("selected"));
  el.classList.add("selected");
}

/* ══════════════════════════════════════════════════════════
   CREATE & DELETE POSTS
   ══════════════════════════════════════════════════════════ */

/**
 * Creates a new post from the form inputs.
 * Validates that both title and content are filled in.
 * Adds the post to the beginning of feedPosts (newest first).
 * See: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/unshift
 */
function submitPost() {
  const title = document.getElementById("post-title").value.trim();
  const content = document.getElementById("post-content").value.trim();

  if (!title || !content) {
    showToast("Please fill in both title and content.");
    return;
  }

  const data = getAppData();
  const currentUser = getCurrentUser(data);

  if (!currentUser) {
    showToast("You must be logged in.");
    return;
  }

  const currentAvatar = currentUser.avatar || currentUser.username.slice(0, 2).toUpperCase();

  /* Build the new post object */
  feedPosts.unshift({
    id: ++postIdCounter,
    userId: currentUser.id,
    type: selectedType,
    username: currentUser.username,
    avatarClass: DEFAULT_AVATAR_CLASS,
    avatarText: currentAvatar,
    game: DEFAULT_GAME,
    timestamp: formatTimestamp(new Date().toISOString()),
    title: title,
    content: content,
    likes: 0,
    liked: false,
    comments: [],
    hasAchievement: false,
    achievementName: ""
  });

  syncPostsToStorage();
  clearForm();
  renderFeed();
  showToast("Post published!");
}

/**
 * Deletes a post by ID (only allowed for the post owner).
 * Removes it from the in-memory array and syncs to storage.
 * See: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/splice
 */
function deletePost(postId) {
  const data = getAppData();
  const currentUser = getCurrentUser(data);
  if (!currentUser) return;

  const postIndex = feedPosts.findIndex(post => post.id === postId);
  if (postIndex === -1) return;

  /* Security check: only the post author can delete */
  const post = feedPosts[postIndex];
  if (post.userId !== currentUser.id) return;

  feedPosts.splice(postIndex, 1);
  syncPostsToStorage();
  renderFeed();

  /* Close the modal if it was showing the deleted post */
  if (currentModalPostId === postId) {
    closeModal();
  }

  showToast("Post deleted!");
}

/** Clears the create-post form and resets the type selection. */
function clearForm() {
  document.getElementById("post-title").value = "";
  document.getElementById("post-content").value = "";
  selectedType = POST_TYPES.UPDATE;
  document.querySelectorAll(".type-chip").forEach(c => c.classList.remove("selected"));
  const defaultChip = document.querySelector(".type-chip.update");
  if (defaultChip) defaultChip.classList.add("selected");
}

/**
 * Smoothly scrolls to the create-post box and focuses the title.
 * See: https://developer.mozilla.org/en-US/docs/Web/API/Element/scrollIntoView
 */
function scrollToCreate() {
  document.getElementById("create-post-box").scrollIntoView({ behavior: "smooth", block: "center" });
  document.getElementById("post-title").focus();
}

/* ══════════════════════════════════════════════════════════
   POST DETAIL MODAL
   ══════════════════════════════════════════════════════════ */

/**
 * Opens the post detail modal for a given post.
 * Shows the FULL (untruncated) content, comments, and actions.
 * See: https://developer.mozilla.org/en-US/docs/Web/API/Element/classList
 */
function openModal(postId) {
  const post = feedPosts.find(p => p.id === postId);
  if (!post) return;

  currentModalPostId = postId;
  populateModal(post);
  renderComments(post);
  document.getElementById("modal-overlay").classList.add("open");
  document.body.style.overflow = "hidden";  /* Prevent background scrolling */
}

/** Fills the modal DOM elements with the post data. */
function populateModal(post) {
  const mainColor = POST_TYPE_COLORS[post.type] || POST_TYPE_COLORS.update;
  document.getElementById("modal-top-bar").style.background = mainColor;

  const av = document.getElementById("modal-avatar");
  av.className = `av ${post.avatarClass}`;
  av.style.width = "44px";
  av.style.height = "44px";
  av.style.borderRadius = "6px";
  av.style.fontSize = "16px";
  av.textContent = post.avatarText;

  document.getElementById("modal-username").textContent = `${post.username} · ${post.game}`;
  document.getElementById("modal-timestamp").textContent = post.timestamp;
  document.getElementById("modal-title").textContent = post.title;
  document.getElementById("modal-title").style.color = mainColor;

  /* The modal shows FULL content — no truncation (unlike the feed) */
  document.getElementById("modal-content").textContent = post.content;

  document.getElementById("modal-likes-count").textContent = post.likes;
  document.getElementById("comments-count-label").textContent = `(${post.comments.length})`;

  const btn = document.getElementById("modal-like-btn");
  btn.classList.toggle("liked", post.liked);
}

/**
 * Renders the comments list inside the modal.
 * See: https://developer.mozilla.org/en-US/docs/Web/API/Document/createElement
 */
function renderComments(post) {
  const list = document.getElementById("comments-list");
  list.innerHTML = "";
  document.getElementById("comments-count-label").textContent = `(${post.comments.length})`;

  if (post.comments.length === 0) {
    list.innerHTML = '<div style="color:#666;font-size:13px;">No comments yet.</div>';
    return;
  }

  post.comments.forEach(c => {
    const item = document.createElement("div");
    item.className = "comment-item";
    item.innerHTML = `
      <div class="av ${c.avatarClass}">${c.avatarText}</div>
      <div class="comment-bubble">
        <div class="comment-top">
          <span class="comment-user">${c.user}</span>
          <span class="comment-time">${c.time}</span>
        </div>
        <div class="comment-text">${c.text}</div>
      </div>`;
    list.appendChild(item);
  });
}

//  removed the functionality to interact with comments
// <div class="comment-likes">${SVG_ICONS.heart} ${c.likes}</div>

/** Closes the post detail modal. */
function closeModal() {
  document.getElementById("modal-overlay").classList.remove("open");
  document.body.style.overflow = "";
  currentModalPostId = null;
  document.getElementById("comment-input").value = "";
}

/**
 * Closes the modal if the user clicks on the overlay background.
 * See: https://developer.mozilla.org/en-US/docs/Web/API/Event/target
 */
function handleOverlayClick(e) {
  if (e.target === document.getElementById("modal-overlay")) closeModal();
}

/** Toggles like on the currently open modal's post. */
function modalToggleLike() {
  if (currentModalPostId) toggleLike(currentModalPostId);
}

/**
 * Submits a new comment on the currently open post.
 * Creates a comment object and appends it to the post's comments array.
 * See: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/push
 */
function submitComment() {
  if (!currentModalPostId) return;

  const input = document.getElementById("comment-input");
  const text = input.value.trim();
  if (!text) return;

  const data = getAppData();
  const currentUser = getCurrentUser(data);
  if (!currentUser) return;

  const post = feedPosts.find(p => p.id === currentModalPostId);
  if (!post) return;

  const currentAvatar = currentUser.avatar || currentUser.username.slice(0, 2).toUpperCase();

  post.comments.push({
    id: Date.now(),
    user: currentUser.username,
    avatarClass: DEFAULT_AVATAR_CLASS,
    avatarText: currentAvatar,
    text: text,
    time: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
    likes: 0
  });

  input.value = "";
  syncPostsToStorage();
  renderComments(post);
  renderFeed();
  populateModal(post);
  showToast("Comment posted!");
}

/* ══════════════════════════════════════════════════════════
   UTILITIES
   ══════════════════════════════════════════════════════════ */

/**
 * Shows a toast notification at the bottom of the screen.
 * See: https://developer.mozilla.org/en-US/docs/Web/API/setTimeout
 */
function showToast(msg) {
  const t = document.getElementById("toast");
  t.textContent = msg;
  t.classList.add("show");
  setTimeout(() => t.classList.remove("show"), TOAST_DURATION_MS);
}

/* ── Keyboard shortcuts ──────────────────────────────────── */
/* See: https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/key */
document.addEventListener("keydown", e => {
  if (e.key === "Escape") closeModal();
});

/* ── Start the application ───────────────────────────────── */
init();
