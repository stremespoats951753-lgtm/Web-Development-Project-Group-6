let currentFilter = "all";
let selectedType = "update";
let currentModalPostId = null;
let feedPosts = [];
let postIdCounter = 100;

const STORAGE_KEY = "gamerfeedData";

const defaultPosts = [
  {
    id: 1,
    userId: "demo_nightkira",
    type: "achievement",
    username: "NightKira",
    avatarClass: "gold",
    avatarText: "NK",
    game: "Elden Ring",
    timestamp: "Mar 15, 2026 at 14:32",
    title: "Finally Got the Platinum!",
    content: "After 200+ hours, I finally got the Platinum Trophy for Elden Ring. The hardest part was the Malenia fight — took me 47 attempts. If anyone is struggling, focus on dodging the scarlet rot and learn her second phase timing. Worth every second.",
    likes: 284,
    liked: false,
    hasAchievement: true,
    achievementName: "Elden Ring Platinum",
    comments: [
      { id: 1, user: "AxelRift", avatarClass: "green", avatarText: "AX", text: "Congrats! Malenia is brutal. Did you use the bleed build?", time: "14:45", likes: 12 },
      { id: 2, user: "VoidX", avatarClass: "purple", avatarText: "VX", text: "Insane achievement. 47 attempts on Malenia means you were determined.", time: "15:01", likes: 8 }
    ]
  },
  {
    id: 2,
    userId: "demo_axelrift",
    type: "update",
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
    comments: [
      { id: 1, user: "StormFang", avatarClass: "red", avatarText: "SF", text: "The vehicle combat was so clunky before. Glad they finally fixed it.", time: "12:30", likes: 5 }
    ]
  },
  {
    id: 3,
    userId: "demo_voidx",
    type: "discussion",
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
    comments: [
      { id: 1, user: "NightKira", avatarClass: "gold", avatarText: "NK", text: "Completely agree. Players will pay full price for a great SP game.", time: "10:15", likes: 34 },
      { id: 2, user: "AxelRift", avatarClass: "green", avatarText: "AX", text: "Live service can work when done right (Deep Rock Galactic) but most studios chase trends not quality.", time: "10:42", likes: 21 },
      { id: 3, user: "StormFang", avatarClass: "red", avatarText: "SF", text: "Both can coexist. The problem is executives, not the format.", time: "11:03", likes: 18 }
    ]
  },
  {
    id: 4,
    userId: "demo_stormfang",
    type: "update",
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
    comments: []
  }
];

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

function getAvatarClassFromText(text) {
  const value = String(text || "").toUpperCase();
  if (value === "NK") return "gold";
  if (value === "VX") return "purple";
  if (value === "SF") return "red";
  return "green";
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
    (username ? username.slice(0, 2).toUpperCase() : "??");

  const avatarClass =
    post.avatarClass ||
    getAvatarClassFromText(avatarText);

  const type =
    post.type === "achievement" || post.type === "discussion" || post.type === "update"
      ? post.type
      : "update";

  const rawLikes = post.likes;
  const likes =
    typeof rawLikes === "number"
      ? rawLikes
      : Array.isArray(rawLikes)
        ? rawLikes.length
        : 0;

  const comments = Array.isArray(post.comments)
    ? post.comments.map(comment => normalizeComment(comment, username))
    : [];

  const title = post.title || "Untitled Post";
  const content = post.content || "";
  const hasAchievement =
    typeof post.hasAchievement === "boolean"
      ? post.hasAchievement
      : type === "achievement";

  const achievementName =
    post.achievementName ||
    (type === "achievement" ? title : "");

  return {
    id: post.id,
    userId: post.userId || null,
    type,
    username,
    avatarClass,
    avatarText,
    game: post.game || "Your Game",
    timestamp: formatTimestamp(post.timestamp),
    title,
    content,
    likes,
    liked: typeof post.liked === "boolean" ? post.liked : false,
    hasAchievement,
    achievementName,
    comments
  };
}

function openMyProfile() {
  const data = getAppData();
  const currentUser = getCurrentUser(data);

  if (!currentUser) return;

  window.location.href = `../HTML/profile.html?user=${encodeURIComponent(currentUser.id)}`;
}

function normalizeAllPosts(posts, data) {
  return posts.map(post => normalizePost(post, data));
}

function syncPostsToStorage() {
  const data = getAppData();
  data.posts = feedPosts;
  saveAppData(data);
}

function resetDemoPosts() {
  const data = getAppData();
  data.posts = [...defaultPosts];
  saveAppData(data);
  feedPosts = [...defaultPosts];
  renderFeed();
}

function init() {
  const data = getAppData();
  const currentUser = getCurrentUser(data);

  if (!currentUser) {
    window.location.href = "auth.html";
    return;
  }

  if (Array.isArray(data.posts) && data.posts.length > 0) {
    feedPosts = normalizeAllPosts(data.posts, data);
  } else {
    feedPosts = [...defaultPosts];
    data.posts = [...defaultPosts];
    saveAppData(data);
  }

  const maxId = feedPosts.reduce((max, post) => Math.max(max, Number(post.id) || 0), 0);
  postIdCounter = Math.max(100, maxId);

  const avatarChip = document.querySelector(".avatar-chip");
  const postAvatar = document.querySelector(".post-avatar");
  const currentAvatar = currentUser.avatar || currentUser.username.slice(0, 2).toUpperCase();

  if (avatarChip) {
    avatarChip.textContent = currentAvatar;
  }

  if (postAvatar) {
    postAvatar.textContent = currentAvatar;
  }

  bindLogout();
  renderFeed();
}

function bindLogout() {
  const logoutBtn = document.getElementById("logoutBtn");
  if (!logoutBtn) return;

  logoutBtn.addEventListener("click", function () {
    const data = getAppData();
    data.currentUserId = null;
    saveAppData(data);
    window.location.href = "auth.html";
  });
}

function renderFeed() {
  const container = document.getElementById("feed-container");
  container.innerHTML = "";

  let posts;
  if (currentFilter === "all") {
    posts = feedPosts;
  } else {
    posts = feedPosts.filter(p => p.type === currentFilter);
  }

  if (posts.length === 0) {
    container.innerHTML = '<div style="text-align:center;padding:40px;color:#555;">No posts found.</div>';
    return;
  }

  posts.forEach(post => container.appendChild(buildCard(post)));
}

function buildCard(post) {
  const card = document.createElement("div");
  card.className = `post-card ${post.type}`;
  card.onclick = () => openModal(post.id);

  const data = getAppData();
  const currentUser = getCurrentUser(data);
  const isOwnPost = currentUser && post.userId === currentUser.id;

  let achievementHTML = "";
  if (post.hasAchievement) {
    achievementHTML = `
      <div class="achievement-banner">
        <svg viewBox="0 0 24 24" fill="none" stroke="#f5a000" stroke-width="2" style="width:20px;height:20px">
          <path d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"/>
        </svg>
        <div>
          <div class="achievement-label">ACHIEVEMENT UNLOCKED</div>
          <div class="achievement-name">${post.achievementName}</div>
        </div>
      </div>`;
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
    <div class="card-actions" onclick="event.stopPropagation()">
      <button class="action-btn ${post.liked ? "liked" : ""}" onclick="toggleLike(${post.id})">
        ♥ ${post.likes}
      </button>
      <button class="action-btn" onclick="openModal(${post.id})">
        💬 ${post.comments.length}
      </button>
      ${isOwnPost ? `<button class="action-btn delete-btn" onclick="deletePost(${post.id})">Delete</button>` : ""}
      <span class="read-more" onclick="openModal(${post.id})">READ MORE →</span>
    </div>`;

  return card;
}

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

  if (currentModalPostId === postId) {
    populateModal(post);
  }
}

function setFilter(filter, el) {
  currentFilter = filter;
  document.querySelectorAll(".feed-filter").forEach(f => f.classList.remove("active"));
  if (el && el.classList) el.classList.add("active");
  renderFeed();
}

function selectType(type, el) {
  selectedType = type;
  document.querySelectorAll(".type-chip").forEach(c => c.classList.remove("selected"));
  el.classList.add("selected");
}

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

  feedPosts.unshift({
    id: ++postIdCounter,
    userId: currentUser.id,
    type: selectedType,
    username: currentUser.username,
    avatarClass: "green",
    avatarText: currentAvatar,
    game: "Your Game",
    timestamp: formatTimestamp(new Date().toISOString()),
    title: title,
    content: content,
    likes: 0,
    liked: false,
    comments: [],
    hasAchievement: selectedType === "achievement",
    achievementName: selectedType === "achievement" ? title : ""
  });

  syncPostsToStorage();
  clearForm();
  renderFeed();
  showToast("Post published!");
}

function deletePost(postId) {
  const data = getAppData();
  const currentUser = getCurrentUser(data);
  if (!currentUser) return;

  const postIndex = feedPosts.findIndex(post => post.id === postId);
  if (postIndex === -1) return;

  const post = feedPosts[postIndex];
  if (post.userId !== currentUser.id) return;

  feedPosts.splice(postIndex, 1);
  syncPostsToStorage();
  renderFeed();

  if (currentModalPostId === postId) {
    closeModal();
  }

  showToast("Post deleted!");
}

function clearForm() {
  document.getElementById("post-title").value = "";
  document.getElementById("post-content").value = "";
  selectedType = "update";
  document.querySelectorAll(".type-chip").forEach(c => c.classList.remove("selected"));
  const defaultChip = document.querySelector(".type-chip.update");
  if (defaultChip) {
    defaultChip.classList.add("selected");
  }
}

function scrollToCreate() {
  document.getElementById("create-post-box").scrollIntoView({ behavior: "smooth", block: "center" });
  document.getElementById("post-title").focus();
}

function openModal(postId) {
  const post = feedPosts.find(p => p.id === postId);
  if (!post) return;

  currentModalPostId = postId;
  populateModal(post);
  renderComments(post);
  document.getElementById("modal-overlay").classList.add("open");
  document.body.style.overflow = "hidden";
}

function populateModal(post) {
  const typeColors = {
    update: "#00f5a0",
    achievement: "#f5a000",
    discussion: "#7a6fff"
  };

  const mainColor = typeColors[post.type] || "#00f5a0";
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
  document.getElementById("modal-content").textContent = post.content;
  document.getElementById("modal-likes-count").textContent = post.likes;
  document.getElementById("comments-count-label").textContent = `(${post.comments.length})`;

  const btn = document.getElementById("modal-like-btn");
  btn.classList.toggle("liked", post.liked);
}

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
      <div class="av ${c.avatarClass}">
        ${c.avatarText}
      </div>
      <div class="comment-bubble">
        <div class="comment-top">
          <span class="comment-user">${c.user}</span>
          <span class="comment-time">${c.time}</span>
        </div>
        <div class="comment-text">${c.text}</div>
        <div class="comment-likes">♥ ${c.likes}</div>
      </div>
    `;

    list.appendChild(item);
  });
}

function closeModal() {
  document.getElementById("modal-overlay").classList.remove("open");
  document.body.style.overflow = "";
  currentModalPostId = null;
  document.getElementById("comment-input").value = "";
}

function handleOverlayClick(e) {
  if (e.target === document.getElementById("modal-overlay")) closeModal();
}

function modalToggleLike() {
  if (currentModalPostId) toggleLike(currentModalPostId);
}

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
    avatarClass: "green",
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

function showToast(msg) {
  const t = document.getElementById("toast");
  t.textContent = msg;
  t.classList.add("show");
  setTimeout(() => t.classList.remove("show"), 2800);
}

document.addEventListener("keydown", e => {
  if (e.key === "Escape") closeModal();
});

init();