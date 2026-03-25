const STORAGE_KEY = "gamerfeedData";

let viewedUser = null;
let currentUser = null;
let viewedUserPosts = [];

function getAppData() {
  const rawData = localStorage.getItem(STORAGE_KEY);

  if (!rawData) {
    const initialData = {
      currentUserId: null,
      users: [],
      posts: []
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(initialData));
    return initialData;
  }

  try {
    return JSON.parse(rawData);
  } catch (error) {
    console.error("Failed to parse localStorage data:", error);
    const fallbackData = {
      currentUserId: null,
      users: [],
      posts: []
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(fallbackData));
    return fallbackData;
  }
}

function saveAppData(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function getCurrentUser(data) {
  return data.users.find(user => user.id === data.currentUserId) || null;
}

function getUserById(data, userId) {
  return data.users.find(user => user.id === userId) || null;
}

function getAvatarClassFromText(text) {
  const value = String(text || "").toUpperCase();
  if (value === "NK") return "gold";
  if (value === "VX") return "purple";
  if (value === "SF") return "red";
  return "green";
}

function formatTimestamp(value) {
  if (!value) return "";

  if (typeof value === "string" && value.includes(" at ")) {
    return value;
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
}

function normalizeComment(comment, fallbackUser) {
  return {
    id: comment.id || Date.now(),
    user: comment.user || fallbackUser || "Unknown User",
    avatarClass: comment.avatarClass || "green",
    avatarText: comment.avatarText || "??",
    text: comment.text || "",
    time: comment.time || "",
    likes: typeof comment.likes === "number" ? comment.likes : 0
  };
}

function normalizePost(post, data) {
  const linkedUser = post.userId ? getUserById(data, post.userId) : null;

  const username =
    post.username ||
    linkedUser?.username ||
    "Unknown User";

  const avatarText =
    post.avatarText ||
    post.avatar ||
    linkedUser?.avatar ||
    username.slice(0, 2).toUpperCase();

  const avatarClass =
    post.avatarClass ||
    getAvatarClassFromText(avatarText);

  const likes =
    typeof post.likes === "number"
      ? post.likes
      : Array.isArray(post.likes)
        ? post.likes.length
        : 0;

  const comments = Array.isArray(post.comments)
    ? post.comments.map(comment => normalizeComment(comment, username))
    : [];

  return {
    id: post.id,
    userId: post.userId || null,
    type: ["update", "achievement", "discussion"].includes(post.type) ? post.type : "update",
    username,
    avatarText,
    avatarClass,
    game: post.game || "Your Game",
    timestamp: formatTimestamp(post.timestamp),
    title: post.title || "Untitled Post",
    content: post.content || "",
    likes,
    liked: typeof post.liked === "boolean" ? post.liked : false,
    hasAchievement: typeof post.hasAchievement === "boolean" ? post.hasAchievement : post.type === "achievement",
    achievementName: post.achievementName || (post.type === "achievement" ? (post.title || "Achievement") : ""),
    comments
  };
}

function getDemoUser(userId) {
  const demoUsers = {
    demo_nightkira: {
      id: "demo_nightkira",
      username: "NightKira",
      email: "nightkira@gamerfeed.demo",
      bio: "Achievement hunter and soulslike grinder.",
      avatar: "NK",
      followers: [],
      following: []
    },
    demo_axelrift: {
      id: "demo_axelrift",
      username: "AxelRift",
      email: "axelrift@gamerfeed.demo",
      bio: "Patch-note addict and RPG fan.",
      avatar: "AX",
      followers: [],
      following: []
    },
    demo_voidx: {
      id: "demo_voidx",
      username: "VoidX",
      email: "voidx@gamerfeed.demo",
      bio: "Hot takes, long threads, zero regrets.",
      avatar: "VX",
      followers: [],
      following: []
    },
    demo_stormfang: {
      id: "demo_stormfang",
      username: "StormFang",
      email: "stormfang@gamerfeed.demo",
      bio: "Always answering the call for Super Earth.",
      avatar: "SF",
      followers: [],
      following: []
    }
  };

  return demoUsers[userId] || null;
}

function getViewedUser(data) {
  const params = new URLSearchParams(window.location.search);
  const userId = params.get("user");

  if (!userId) {
    return getCurrentUser(data);
  }

  return getUserById(data, userId) || getDemoUser(userId) || getCurrentUser(data);
}

function buildProfilePostCard(post) {
  const card = document.createElement("div");
  card.className = `post-card ${post.type}`;

  let achievementHTML = "";
  if (post.hasAchievement) {
    achievementHTML = `
      <div class="achievement-banner">
        <div>
          <div class="achievement-label">ACHIEVEMENT UNLOCKED</div>
          <div class="achievement-name">${post.achievementName}</div>
        </div>
      </div>
    `;
  }

  const typeLabels = {
    update: "UPDATE",
    achievement: "ACHIEVEMENT",
    discussion: "DISCUSSION"
  };

  card.innerHTML = `
    <div class="card-body">
      <div class="card-meta">
        <div class="av ${post.avatarClass}">${post.avatarText}</div>
        <div>
          <div class="card-username">${post.username} <span class="game-tag">${post.game}</span></div>
          <div class="card-timestamp">${post.timestamp}</div>
        </div>
        <span class="type-badge">${typeLabels[post.type]}</span>
      </div>
      <div class="card-title">${post.title}</div>
      ${achievementHTML}
      <div class="card-content">${post.content}</div>
    </div>
    <div class="card-actions">
      <button class="action-btn">♥ ${post.likes}</button>
      <button class="action-btn">💬 ${post.comments.length}</button>
    </div>
  `;

  return card;
}

function renderProfileHeader(data) {
  const isOwnProfile = viewedUser.id === currentUser.id;
  const avatarText = viewedUser.avatar || viewedUser.username.slice(0, 2).toUpperCase();

  const profileAvatar = document.getElementById("profileAvatar");
  const profileUsername = document.getElementById("profileUsername");
  const profileEmail = document.getElementById("profileEmail");
  const profileBio = document.getElementById("profileBio");
  const profilePostsCount = document.getElementById("profilePostsCount");
  const profileFollowersCount = document.getElementById("profileFollowersCount");
  const profileFollowingCount = document.getElementById("profileFollowingCount");
  const profileOwnerBadge = document.getElementById("profileOwnerBadge");
  const editProfileBtn = document.getElementById("editProfileBtn");
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

  if (profilePostsCount) profilePostsCount.textContent = viewedUserPosts.length;
  if (profileFollowersCount) {
    profileFollowersCount.textContent = Array.isArray(viewedUser.followers) ? viewedUser.followers.length : 0;
  }
  if (profileFollowingCount) {
    profileFollowingCount.textContent = Array.isArray(viewedUser.following) ? viewedUser.following.length : 0;
  }

  if (profileOwnerBadge) profileOwnerBadge.style.display = isOwnProfile ? "inline-flex" : "none";
  if (editProfileBtn) editProfileBtn.style.display = isOwnProfile ? "inline-flex" : "none";

  if (sideUsername) sideUsername.textContent = viewedUser.username || "Unknown User";
  if (sideBio) sideBio.textContent = viewedUser.bio || "No bio yet.";

  if (headerAvatar && currentUser) {
    headerAvatar.textContent = currentUser.avatar || currentUser.username.slice(0, 2).toUpperCase();
  }
}

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

function renderPage() {
  const data = getAppData();
  const allPosts = Array.isArray(data.posts) ? data.posts.map(post => normalizePost(post, data)) : [];
  viewedUserPosts = allPosts.filter(post => post.userId === viewedUser.id);

  renderProfileHeader(data);
  renderProfilePosts(data);
}

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

function closeEditProfile() {
  const modal = document.getElementById("editProfileModal");
  if (modal) modal.classList.remove("open");
  document.body.style.overflow = "";
}

function saveProfileEdits() {
  if (!viewedUser || !currentUser || viewedUser.id !== currentUser.id) return;

  const usernameInput = document.getElementById("editUsernameInput");
  const bioInput = document.getElementById("editBioInput");

  const newUsername = usernameInput ? usernameInput.value.trim() : "";
  const newBio = bioInput ? bioInput.value.trim() : "";

  if (newUsername.length < 3) {
    showToast("Username must be at least 3 characters.");
    return;
  }

  const data = getAppData();

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

  data.users[userIndex].username = newUsername;
  data.users[userIndex].bio = newBio;
  data.users[userIndex].avatar = newUsername.slice(0, 2).toUpperCase();

  data.posts = data.posts.map(post => {
    if (post.userId === currentUser.id) {
      return {
        ...post,
        username: newUsername,
        avatarText: newUsername.slice(0, 2).toUpperCase(),
        avatarClass: "green"
      };
    }
    return post;
  });

  saveAppData(data);

  currentUser = data.users[userIndex];
  viewedUser = data.users[userIndex];

  closeEditProfile();
  renderPage();
  showToast("Profile updated!");
}

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

function openMyProfile() {
  const data = getAppData();
  const user = getCurrentUser(data);
  if (!user) return;
  window.location.href = `../HTML/profile.html?user=${encodeURIComponent(user.id)}`;
}

function goHome() {
  window.location.href = "../HTML/index.html";
}

function showToast(msg) {
  const toast = document.getElementById("toast");
  if (!toast) return;

  toast.textContent = msg;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 2800);
}

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

document.addEventListener("keydown", function (e) {
  if (e.key === "Escape") {
    closeEditProfile();
  }
});

init();