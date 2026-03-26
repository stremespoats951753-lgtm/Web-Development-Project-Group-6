/**
 * ============================================================
 * profile.js — User Profile Page Logic for GamerFeed
 * ============================================================
 * 
 * This script manages the profile page:
 *   - Determining which user's profile to display (via URL param).
 *   - Rendering profile info (avatar, username, bio, stats).
 *   - Showing that user's posts with the SAME card structure as
 *     the main feed (truncated content, like/comment/delete).
 *   - Opening a post detail modal for full content + comments.
 *   - Edit profile (username, bio) for the logged-in user.
 *   - Follow / Unfollow functionality.
 * 
 * POST DISPLAY NOTE:
 * ──────────────────
 * Previously, profile page posts showed full untruncated content.
 * This has been updated: profile posts now use the SAME card
 * structure as the main feed (index.html), with CSS truncation
 * to ~3 lines and a "READ MORE" link that opens a modal with
 * the full content, comments, and like/comment/delete actions.
 * 
 * This provides a consistent UX across the app and lets users
 * interact with posts (like, comment, delete) directly from
 * the profile page.
 * 
 * FOLLOW SYSTEM:
 * ──────────────
 * - Users CANNOT follow themselves (the Follow button is hidden
 *   on one's own profile via isOwnProfile() check).
 * - Following is stored as an array of user IDs in the
 *   currentUser's "following" field.
 * - Follower counts are computed by counting how many other users
 *   have the viewed user in their "following" array.
 * - When a user follows someone, that person's posts appear in
 *   the "Following" feed on index.html.
 * 
 * DEPENDENCIES:
 *   - config.js (STORAGE_KEY, DEFAULT_AVATAR_CLASS, DEMO_USERS,
 *     SVG_ICONS, POST_TYPE_LABELS, POST_TYPE_COLORS, etc.)
 *   - theme.js (theme toggle)
 * 
 * RESOURCES:
 *   - DOM manipulation: https://developer.mozilla.org/en-US/docs/Web/API/Document/getElementById
 *   - createElement: https://developer.mozilla.org/en-US/docs/Web/API/Document/createElement
 *   - innerHTML: https://developer.mozilla.org/en-US/docs/Web/API/Element/innerHTML
 *   - addEventListener: https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener
 *   - URLSearchParams: https://developer.mozilla.org/en-US/docs/Web/API/URLSearchParams
 *   - Array methods: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array
 *   - localStorage: https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage
 *   - JSON: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON
 *   - classList: https://developer.mozilla.org/en-US/docs/Web/API/Element/classList
 *   - CSS max-height (truncation): https://developer.mozilla.org/en-US/docs/Web/CSS/max-height
 *   - CSS overflow: https://developer.mozilla.org/en-US/docs/Web/CSS/overflow
 * ============================================================
 */

/* ── Page-level State ────────────────────────────────────── */
/** The user whose profile is being viewed */
let viewedUser = null;
/** The currently logged-in user */
let currentUser = null;
/** Posts belonging to the viewed user (normalised) */
let viewedUserPosts = [];
/** ID of the post currently shown in the modal (null if closed) */
let currentModalPostId = null;

/* ══════════════════════════════════════════════════════════
   DATA ACCESS FUNCTIONS
   ══════════════════════════════════════════════════════════ */

/**
 * Retrieves the full app data from localStorage.
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

/**
 * Look up a demo user by their ID.
 * Demo users are defined in config.js (DEMO_USERS constant).
 */
function getDemoUser(userId) {
  return DEMO_USERS[userId] || null;
}

/** Returns the following array for a user, or empty array. */
function getFollowingList(user) {
  return Array.isArray(user?.following) ? user.following : [];
}

/* ══════════════════════════════════════════════════════════
   PROFILE HELPERS
   ══════════════════════════════════════════════════════════ */

/** Returns true if the viewed profile belongs to the logged-in user. */
function isOwnProfile() {
  return viewedUser && currentUser && viewedUser.id === currentUser.id;
}

/** Returns true if the logged-in user follows the viewed user. */
function isFollowingViewedUser() {
  if (!currentUser || !viewedUser) return false;
  return getFollowingList(currentUser).includes(viewedUser.id);
}

/**
 * Counts how many real users follow a given user.
 * We compute this by checking every user's "following" array.
 * See: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/forEach
 */
function getFollowerCount(data, userId) {
  let count = 0;
  data.users.forEach(user => {
    if (Array.isArray(user.following) && user.following.includes(userId)) {
      count++;
    }
  });
  return count;
}

/**
 * Maps avatar text to a CSS colour class.
 * Uses the AVATAR_COLOR_MAP from config.js.
 */
function getAvatarClassFromText(text) {
  const value = String(text || "").toUpperCase();
  return AVATAR_COLOR_MAP[value] || DEFAULT_AVATAR_CLASS;
}

/**
 * Formats a timestamp for display.
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

/* ── Post Normalisation ──────────────────────────────────── */

/**
 * Ensures a comment object has all required fields.
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
 * See: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Optional_chaining
 */
function normalizePost(post, data) {
  const linkedUser = post.userId ? getUserById(data, post.userId) : null;
  const username = post.username || linkedUser?.username || "Unknown User";
  const avatarText = post.avatarText || post.avatar || linkedUser?.avatar ||
    username.slice(0, 2).toUpperCase();
  const avatarClass = post.avatarClass || getAvatarClassFromText(avatarText);
  const likes = typeof post.likes === "number" ? post.likes
    : Array.isArray(post.likes) ? post.likes.length : 0;
  const comments = Array.isArray(post.comments)
    ? post.comments.map(c => normalizeComment(c, username)) : [];

  return {
    id: post.id,
    userId: post.userId || null,
    type: [POST_TYPES.UPDATE, POST_TYPES.ACHIEVEMENT, POST_TYPES.DISCUSSION].includes(post.type) ? post.type : POST_TYPES.UPDATE,
    username, avatarText, avatarClass,
    game: post.game || DEFAULT_GAME,
    timestamp: formatTimestamp(post.timestamp),
    title: post.title || "Untitled Post",
    content: post.content || "",
    likes,
    liked: typeof post.liked === "boolean" ? post.liked : false,
    hasAchievement: false,
    achievementName: "",
    comments
  };
}

/* ══════════════════════════════════════════════════════════
   DETERMINE WHICH PROFILE TO SHOW
   ══════════════════════════════════════════════════════════ */

/**
 * Reads the "user" query parameter from the URL to decide
 * whose profile to display. Falls back to the logged-in user.
 * See: https://developer.mozilla.org/en-US/docs/Web/API/URLSearchParams
 */
function getViewedUser(data) {
  const params = new URLSearchParams(window.location.search);
  const userId = params.get("user");

  if (!userId) return getCurrentUser(data);
  return getUserById(data, userId) || getDemoUser(userId) || getCurrentUser(data);
}

/* ══════════════════════════════════════════════════════════
   POST CARD BUILDER (same structure as feed)
   ══════════════════════════════════════════════════════════ */

/**
 * Builds a post card for the profile page.
 * 
 * This now uses the SAME card structure as the main feed:
 * - Content is TRUNCATED via CSS max-height (same as feed).
 * - Cards are clickable → open modal with full content.
 * - Like, comment, and delete buttons are functional.
 * - "READ MORE →" link opens the modal.
 * 
 * This ensures consistent UX across the app.
 * See: https://developer.mozilla.org/en-US/docs/Web/API/Document/createElement
 */
function buildProfilePostCard(post) {
  const card = document.createElement("article");
  card.className = `post-card ${post.type}`;
  /* Clicking the card opens the post detail modal */
  card.onclick = () => openPostModal(post.id);

  const isOwnPost = currentUser && post.userId === currentUser.id;

  card.innerHTML = `
    <div class="card-body">
      <div class="card-meta">
        <div class="av ${post.avatarClass}">${post.avatarText}</div>
        <div>
          <div class="card-username">${post.username} <span class="game-tag">${post.game}</span></div>
          <div class="card-timestamp">${post.timestamp}</div>
        </div>
        <span class="type-badge">${POST_TYPE_LABELS[post.type]}</span>
      </div>
      <div class="card-title">${post.title}</div>
      <div class="card-content">${post.content}</div>
    </div>
    <div class="card-actions" onclick="event.stopPropagation()">
      <button class="action-btn ${post.liked ? "liked" : ""}" onclick="toggleProfileLike(${post.id})">
        ${SVG_ICONS.heart} ${post.likes}
      </button>
      <button class="action-btn" onclick="openPostModal(${post.id})">
        ${SVG_ICONS.comment} ${post.comments.length}
      </button>
      ${isOwnPost ? `<button class="action-btn delete-btn" onclick="deleteProfilePost(${post.id})">${SVG_ICONS.trash} Delete</button>` : ""}
      <span class="read-more" onclick="openPostModal(${post.id})">READ MORE ${SVG_ICONS.arrowRight}</span>
    </div>`;

  return card;
}

/* ══════════════════════════════════════════════════════════
   RENDERING
   ══════════════════════════════════════════════════════════ */

/**
 * Renders the profile header: avatar, name, bio, stats,
 * and action buttons (Edit / Follow).
 * See: https://developer.mozilla.org/en-US/docs/Web/API/Document/getElementById
 */
function renderProfileHeader(data) {
  const ownProfile = isOwnProfile();
  const avatarText = viewedUser.avatar || viewedUser.username.slice(0, 2).toUpperCase();

  /* Update DOM elements */
  const profileAvatar = document.getElementById("profileAvatar");
  const profileUsername = document.getElementById("profileUsername");
  const profileEmail = document.getElementById("profileEmail");
  const profileBio = document.getElementById("profileBio");
  const profilePostsCount = document.getElementById("profilePostsCount");
  const profileFollowersCount = document.getElementById("profileFollowersCount");
  const profileFollowingCount = document.getElementById("profileFollowingCount");
  const profileOwnerBadge = document.getElementById("profileOwnerBadge");
  const editProfileBtn = document.getElementById("editProfileBtn");
  const followToggleBtn = document.getElementById("followToggleBtn");
  const sideUsername = document.getElementById("sideUsername");
  const sideBio = document.getElementById("sideBio");
  const headerAvatar = document.getElementById("headerAvatar");

  if (profileAvatar) {
    profileAvatar.textContent = avatarText;
    profileAvatar.className = `profile-avatar ${getAvatarClassFromText(avatarText)}`;
  }

  if (profileUsername) profileUsername.textContent = viewedUser.username || "Unknown User";
  if (profileEmail) profileEmail.textContent = viewedUser.email || "";
  if (profileBio) profileBio.textContent = viewedUser.bio || "No bio yet.";

  /* Stats */
  if (profilePostsCount) profilePostsCount.textContent = viewedUserPosts.length;
  if (profileFollowersCount) profileFollowersCount.textContent = getFollowerCount(data, viewedUser.id);
  if (profileFollowingCount) {
    profileFollowingCount.textContent = Array.isArray(viewedUser.following) ? viewedUser.following.length : 0;
  }

  /* Badge: "YOU" for own profile, "USER" for others */
  if (profileOwnerBadge) {
    profileOwnerBadge.style.display = "inline-flex";
    profileOwnerBadge.textContent = ownProfile ? "YOU" : "USER";
  }

  /* Show Edit button only on own profile */
  if (editProfileBtn) {
    editProfileBtn.style.display = ownProfile ? "inline-flex" : "none";
  }

  /*
   * Follow/Unfollow button:
   * - Hidden on own profile (can't follow yourself).
   * - Shows "Unfollow" if already following, "Follow" otherwise.
   */
  if (followToggleBtn) {
    if (ownProfile) {
      followToggleBtn.style.display = "none";
    } else {
      followToggleBtn.style.display = "inline-flex";

      if (isFollowingViewedUser()) {
        followToggleBtn.textContent = "Unfollow";
        followToggleBtn.classList.add("btn-unfollow");
      } else {
        followToggleBtn.textContent = "Follow";
        followToggleBtn.classList.remove("btn-unfollow");
      }
    }
  }

  /* Sidebar info */
  if (sideUsername) sideUsername.textContent = viewedUser.username || "Unknown User";
  if (sideBio) sideBio.textContent = viewedUser.bio || "No bio yet.";

  /* Header avatar shows the logged-in user's initials */
  if (headerAvatar && currentUser) {
    headerAvatar.textContent = currentUser.avatar || currentUser.username.slice(0, 2).toUpperCase();
  }
}

/** Renders the user's posts in the profile posts container. */
function renderProfilePosts(data) {
  const container = document.getElementById("profilePostsContainer");
  if (!container) return;
  container.innerHTML = "";

  if (viewedUserPosts.length === 0) {
    container.innerHTML = '<div style="text-align:center;padding:40px;color:#555;">This user has no posts yet.</div>';
    return;
  }

  viewedUserPosts.forEach(post => {
    container.appendChild(buildProfilePostCard(post));
  });
}

/** Full page render: load posts, render header + posts. */
function renderPage() {
  const data = getAppData();
  const allPosts = Array.isArray(data.posts) ? data.posts.map(post => normalizePost(post, data)) : [];
  viewedUserPosts = allPosts.filter(post => post.userId === viewedUser.id);

  renderProfileHeader(data);
  renderProfilePosts(data);
}

/* ══════════════════════════════════════════════════════════
   POST INTERACTIONS (Like, Delete, Comment)
   ══════════════════════════════════════════════════════════ */

/**
 * Toggles the like status on a profile post.
 * Updates localStorage and re-renders the page.
 * See: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/max
 */
function toggleProfileLike(postId) {
  const data = getAppData();
  const postIndex = data.posts.findIndex(p => p.id === postId);
  if (postIndex === -1) return;

  const post = data.posts[postIndex];

  if (post.liked === true) {
    post.liked = false;
    post.likes = Math.max(0, (typeof post.likes === "number" ? post.likes : 0) - 1);
  } else {
    post.liked = true;
    post.likes = (typeof post.likes === "number" ? post.likes : 0) + 1;
  }

  data.posts[postIndex] = post;
  saveAppData(data);
  renderPage();

  /* If the modal is open for this post, update it too */
  if (currentModalPostId === postId) {
    const normalised = normalizePost(post, data);
    populatePostModal(normalised);
    renderModalComments(normalised);
  }
}

/**
 * Deletes a post from the profile page.
 * Only allowed for the post owner.
 * See: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/filter
 */
function deleteProfilePost(postId) {
  if (!currentUser) return;

  const data = getAppData();
  const post = data.posts.find(p => p.id === postId);
  if (!post) return;

  /* Security check: only the post author can delete */
  if (post.userId !== currentUser.id) return;

  data.posts = data.posts.filter(p => p.id !== postId);
  saveAppData(data);

  /* Close the modal if it was showing the deleted post */
  if (currentModalPostId === postId) {
    closePostModal();
  }

  renderPage();
  showToast("Post deleted!");
}

/* ══════════════════════════════════════════════════════════
   POST DETAIL MODAL (Profile page version)
   ══════════════════════════════════════════════════════════ */

/**
 * Opens the post detail modal for a given post.
 * Shows the FULL (untruncated) content, comments, and actions.
 * See: https://developer.mozilla.org/en-US/docs/Web/API/Element/classList
 */
function openPostModal(postId) {
  const data = getAppData();
  const rawPost = data.posts.find(p => p.id === postId);
  if (!rawPost) return;

  const post = normalizePost(rawPost, data);
  currentModalPostId = postId;
  populatePostModal(post);
  renderModalComments(post);
  document.getElementById("postModalOverlay").classList.add("open");
  document.body.style.overflow = "hidden";
}

/** Fills the modal DOM elements with the post data. */
function populatePostModal(post) {
  const mainColor = POST_TYPE_COLORS[post.type] || POST_TYPE_COLORS.update;
  document.getElementById("postModalTopBar").style.background = mainColor;

  const av = document.getElementById("postModalAvatar");
  av.className = `av ${post.avatarClass}`;
  av.style.width = "44px";
  av.style.height = "44px";
  av.style.borderRadius = "6px";
  av.style.fontSize = "16px";
  av.textContent = post.avatarText;

  document.getElementById("postModalUsername").textContent = `${post.username} · ${post.game}`;
  document.getElementById("postModalTimestamp").textContent = post.timestamp;
  document.getElementById("postModalTitle").textContent = post.title;
  document.getElementById("postModalTitle").style.color = mainColor;

  /* The modal shows FULL content — no truncation */
  document.getElementById("postModalContent").textContent = post.content;

  document.getElementById("postModalLikesCount").textContent = post.likes;
  document.getElementById("postModalCommentsLabel").textContent = `(${post.comments.length})`;

  const btn = document.getElementById("postModalLikeBtn");
  btn.classList.toggle("liked", post.liked);
}

/**
 * Renders the comments list inside the modal.
 * See: https://developer.mozilla.org/en-US/docs/Web/API/Document/createElement
 */
function renderModalComments(post) {
  const list = document.getElementById("postModalCommentsList");
  list.innerHTML = "";
  document.getElementById("postModalCommentsLabel").textContent = `(${post.comments.length})`;

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
        <div class="comment-likes">${SVG_ICONS.heart} ${c.likes}</div>
      </div>`;
    list.appendChild(item);
  });
}

/** Closes the post detail modal. */
function closePostModal() {
  document.getElementById("postModalOverlay").classList.remove("open");
  document.body.style.overflow = "";
  currentModalPostId = null;
  const input = document.getElementById("postModalCommentInput");
  if (input) input.value = "";
}

/**
 * Closes the modal if the user clicks on the overlay background.
 * See: https://developer.mozilla.org/en-US/docs/Web/API/Event/target
 */
function handlePostModalOverlayClick(e) {
  if (e.target === document.getElementById("postModalOverlay")) closePostModal();
}

/** Toggles like on the currently open modal's post. */
function modalPostToggleLike() {
  if (currentModalPostId) toggleProfileLike(currentModalPostId);
}

/**
 * Submits a new comment on the currently open post.
 * See: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/push
 */
function submitProfileComment() {
  if (!currentModalPostId) return;

  const input = document.getElementById("postModalCommentInput");
  const text = input.value.trim();
  if (!text) return;

  if (!currentUser) return;

  const data = getAppData();
  const postIndex = data.posts.findIndex(p => p.id === currentModalPostId);
  if (postIndex === -1) return;

  const currentAvatar = currentUser.avatar || currentUser.username.slice(0, 2).toUpperCase();

  if (!Array.isArray(data.posts[postIndex].comments)) {
    data.posts[postIndex].comments = [];
  }

  data.posts[postIndex].comments.push({
    id: Date.now(),
    user: currentUser.username,
    avatarClass: DEFAULT_AVATAR_CLASS,
    avatarText: currentAvatar,
    text: text,
    time: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
    likes: 0
  });

  input.value = "";
  saveAppData(data);

  /* Re-render the modal and page */
  const updatedPost = normalizePost(data.posts[postIndex], data);
  renderModalComments(updatedPost);
  populatePostModal(updatedPost);
  renderPage();
  showToast("Comment posted!");
}

/* ══════════════════════════════════════════════════════════
   EDIT PROFILE
   ══════════════════════════════════════════════════════════ */

/** Opens the edit profile modal (only available on own profile). */
function openEditProfile() {
  if (!viewedUser || !currentUser || viewedUser.id !== currentUser.id) return;

  const usernameInput = document.getElementById("editUsernameInput");
  const bioInput = document.getElementById("editBioInput");
  const modal = document.getElementById("editProfileModal");

  if (usernameInput) usernameInput.value = viewedUser.username || "";
  if (bioInput) bioInput.value = viewedUser.bio || "";
  if (modal) modal.classList.add("open");
  document.body.style.overflow = "hidden";
}

/** Closes the edit profile modal. */
function closeEditProfile() {
  const modal = document.getElementById("editProfileModal");
  if (modal) modal.classList.remove("open");
  document.body.style.overflow = "";
}

/**
 * Saves profile edits (username, bio).
 * Validates username length and uniqueness.
 * Also updates the username on all of the user's existing posts.
 * See: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/trim
 */
function saveProfileEdits() {
  if (!viewedUser || !currentUser || viewedUser.id !== currentUser.id) return;

  const usernameInput = document.getElementById("editUsernameInput");
  const bioInput = document.getElementById("editBioInput");
  const newUsername = usernameInput ? usernameInput.value.trim() : "";
  const newBio = bioInput ? bioInput.value.trim() : "";

  const USERNAME_PATTERN = /^[A-Za-z0-9_]+$/;

  if (newUsername.length < MIN_USERNAME_LENGTH) {
    showToast(`Username must be at least ${MIN_USERNAME_LENGTH} characters.`);
    return;
  }
  if (!USERNAME_PATTERN.test(newUsername)) {
  showToast("Username can only contain letters, numbers, and underscores.");
  return;
}

  const data = getAppData();

  /* Check if another user already has this username */
  const usernameTaken = data.users.some(user =>
    user.id !== currentUser.id &&
    user.username.toLowerCase() === newUsername.toLowerCase()
  );

  if (usernameTaken) {
    showToast("That username is already taken.");
    return;
  }

  const userIndex = data.users.findIndex(user => user.id === currentUser.id);
  if (userIndex === -1) return;

  /* Update the user object */
  data.users[userIndex].username = newUsername;
  data.users[userIndex].bio = newBio;
  data.users[userIndex].avatar = newUsername.slice(0, 2).toUpperCase();

  /* Also update username on all posts by this user */
  data.posts = data.posts.map(post => {
    if (post.userId === currentUser.id) {
      return {
        ...post,
        username: newUsername,
        avatarText: newUsername.slice(0, 2).toUpperCase(),
        avatarClass: DEFAULT_AVATAR_CLASS
      };
    }
    return post;
  });

  saveAppData(data);

  /* Refresh local state */
  currentUser = data.users[userIndex];
  viewedUser = data.users[userIndex];

  closeEditProfile();
  renderPage();
  showToast("Profile updated!");
}

/* ══════════════════════════════════════════════════════════
   FOLLOW / UNFOLLOW
   ══════════════════════════════════════════════════════════ */

/**
 * Toggles following the viewed user.
 * 
 * IMPORTANT: Users cannot follow themselves — this is enforced
 * by hiding the Follow button on own profiles (isOwnProfile check).
 * We also have a safety check here.
 * 
 * The follow relationship is stored in the current user's
 * "following" array. The feed in index.js then uses this array
 * to filter which posts appear when "Following" mode is active.
 * See: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/includes
 */
function toggleFollowUser() {
  /* Prevent self-follow */
  if (!currentUser || !viewedUser || isOwnProfile()) return;

  const data = getAppData();
  const userIndex = data.users.findIndex(user => user.id === currentUser.id);
  if (userIndex === -1) return;

  if (!Array.isArray(data.users[userIndex].following)) {
    data.users[userIndex].following = [];
  }

  const following = data.users[userIndex].following;
  const alreadyFollowing = following.includes(viewedUser.id);

  if (alreadyFollowing) {
    /* Unfollow: remove from the array */
    data.users[userIndex].following = following.filter(id => id !== viewedUser.id);
    showToast(`Unfollowed ${viewedUser.username}`);
  } else {
    /* Follow: add to the array */
    data.users[userIndex].following.push(viewedUser.id);
    showToast(`Following ${viewedUser.username}`);
  }

  saveAppData(data);
  currentUser = data.users[userIndex];
  renderPage();
}

/* ══════════════════════════════════════════════════════════
   NAVIGATION & UTILITIES
   ══════════════════════════════════════════════════════════ */

/** Logout: clears the session and redirects to login. */
function bindLogout() {
  const logoutBtn = document.getElementById("logoutBtn");
  if (!logoutBtn) return;

  logoutBtn.addEventListener("click", function () {
    const data = getAppData();
    data.currentUserId = null;
    saveAppData(data);
    window.location.href = "../HTML/auth.html";
  });
}

/** Navigate to the logged-in user's own profile. */
function openMyProfile() {
  const data = getAppData();
  const user = getCurrentUser(data);
  if (!user) return;
  window.location.href = `../HTML/profile.html?user=${encodeURIComponent(user.id)}`;
}

/** Navigate back to the main feed. */
function goHome() {
  window.location.href = "../HTML/index.html";
}

/**
 * Shows a toast notification.
 * See: https://developer.mozilla.org/en-US/docs/Web/API/setTimeout
 */
function showToast(msg) {
  const toast = document.getElementById("toast");
  if (!toast) return;
  toast.textContent = msg;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), TOAST_DURATION_MS);
}

/* ══════════════════════════════════════════════════════════
   INITIALISATION
   ══════════════════════════════════════════════════════════ */

/**
 * init() runs on page load:
 *   1. Checks if the user is logged in.
 *   2. Determines which profile to show.
 *   3. Renders the page.
 * See: https://developer.mozilla.org/en-US/docs/Web/API/Window/location
 */
function init() {
  const data = getAppData();
  currentUser = getCurrentUser(data);

  if (!currentUser) {
    window.location.href = "../HTML/auth.html";
    return;
  }

  viewedUser = getViewedUser(data);
  bindLogout();
  renderPage();
}

/* ── Keyboard shortcut: Escape closes modals ─────────────── */
/* See: https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/key */
document.addEventListener("keydown", function (e) {
  if (e.key === "Escape") {
    closeEditProfile();
    closePostModal();
  }
});

/* ── Start the page ──────────────────────────────────────── */
init();
