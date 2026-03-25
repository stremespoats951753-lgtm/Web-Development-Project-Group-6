const STORAGE_KEY = "gamerfeedData";

/* =========================
   INITIAL SEED DATA
========================= */
function createInitialData() {
  return {
    currentUserId: "u2",
    users: [
      {
        id: "u1",
        username: "NightKira",
        email: "night@example.com",
        password: "123456",
        bio: "Achievement hunter",
        avatar: "NK",
        following: ["u2"],
        followers: ["u2"]
      },
      {
        id: "u2",
        username: "AxelRift",
        email: "axel@example.com",
        password: "123456",
        bio: "Patch note addict",
        avatar: "AX",
        following: ["u1"],
        followers: ["u1"]
      },
      {
        id: "u3",
        username: "PixelGhost",
        email: "pixel@example.com",
        password: "123456",
        bio: "Souls-like enjoyer",
        avatar: "PG",
        following: [],
        followers: []
      }
    ],
    posts: [
      {
        id: "p1",
        userId: "u1",
        game: "Elden Ring",
        category: "Achievement",
        title: "FINALLY GOT THE PLATINUM!",
        content:
          "After 200+ hours, I finally got the Platinum Trophy for Elden Ring. The hardest part was the Malenia fight — took me 47 attempts. If anyone is struggling, focus on dodging the scarlet rot and learn her second phase timing.",
        timestamp: "2026-03-15T14:32:00",
        likes: ["u2", "u3"],
        comments: [
          {
            id: "c1",
            userId: "u2",
            text: "Huge W. Malenia is brutal.",
            timestamp: "2026-03-15T15:01:00"
          },
          {
            id: "c2",
            userId: "u3",
            text: "Respect. I still have not beaten her solo.",
            timestamp: "2026-03-15T15:09:00"
          }
        ]
      },
      {
        id: "p2",
        userId: "u2",
        game: "Cyberpunk 2077",
        category: "Update",
        title: "NEW 2.5 PATCH CHANGES EVERYTHING",
        content:
          "Just went through the new Cyberpunk 2077 patch notes and this is genuinely exciting. The new vehicle combat system is completely revamped, crafting has been simplified, and there are 3 new gigs in Dogtown. Night City feels alive again.",
        timestamp: "2026-03-15T12:10:00",
        likes: ["u1"],
        comments: []
      }
    ]
  };
}

/* =========================
   STORAGE HELPERS
========================= */
function getAppData() {
  const raw = localStorage.getItem(STORAGE_KEY);

  if (!raw) {
    const seeded = createInitialData();
    saveAppData(seeded);
    return seeded;
  }

  try {
    return JSON.parse(raw);
  } catch (error) {
    console.error("Invalid localStorage data. Resetting.", error);
    const seeded = createInitialData();
    saveAppData(seeded);
    return seeded;
  }
}

function saveAppData(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function getUserById(userId, data) {
  return data.users.find(user => user.id === userId);
}

function getCurrentUser(data) {
  return data.users.find(user => user.id === data.currentUserId);
}

function getPostById(postId, data) {
  return data.posts.find(post => post.id === postId);
}

/* =========================
   FORMATTERS
========================= */
function formatDate(isoString) {
  const date = new Date(isoString);
  return date.toLocaleString([], {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
}

function escapeHTML(value) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/* =========================
   LIKE + COMMENT LOGIC
========================= */
function hasUserLiked(post, currentUserId) {
  return post.likes.includes(currentUserId);
}

function toggleLike(postId) {
  const data = getAppData();
  const currentUser = getCurrentUser(data);
  const post = getPostById(postId, data);

  if (!currentUser || !post) return;

  if (post.likes.includes(currentUser.id)) {
    post.likes = post.likes.filter(id => id !== currentUser.id);
  } else {
    post.likes.push(currentUser.id);
  }

  saveAppData(data);
  renderFeed();
}

function addComment(postId, text) {
  const data = getAppData();
  const currentUser = getCurrentUser(data);
  const post = getPostById(postId, data);

  if (!currentUser || !post) return;

  const cleanText = text.trim();
  if (!cleanText) return;

  post.comments.push({
    id: "c" + Date.now(),
    userId: currentUser.id,
    text: cleanText,
    timestamp: new Date().toISOString()
  });

  saveAppData(data);
  renderFeed();
}

/* =========================
   RENDER HELPERS
========================= */
function renderComments(post, data) {
  if (!post.comments.length) {
    return `<div class="empty-comments">No comments yet. Be the first to reply.</div>`;
  }

  return post.comments
    .map(comment => {
      const user = getUserById(comment.userId, data);

      return `
        <div class="comment-item">
          <div class="comment-head">
            <span class="comment-username">${escapeHTML(user ? user.username : "Unknown User")}</span>
            <span class="comment-time">${formatDate(comment.timestamp)}</span>
          </div>
          <div class="comment-text">${escapeHTML(comment.text)}</div>
        </div>
      `;
    })
    .join("");
}

function renderPost(post, data) {
  const author = getUserById(post.userId, data);
  const currentUser = getCurrentUser(data);
  const liked = currentUser ? hasUserLiked(post, currentUser.id) : false;

  return `
    <article class="post-card" data-post-id="${post.id}">
      <div class="post-header">
        <div class="post-user-wrap">
          <div class="avatar-box">${escapeHTML(author?.avatar || "??")}</div>

          <div class="user-meta">
            <div class="user-topline">
              <span class="username">${escapeHTML(author?.username || "Unknown User")}</span>
              <span class="game-chip">${escapeHTML(post.game)}</span>
            </div>
            <span class="post-date">${formatDate(post.timestamp)}</span>
          </div>
        </div>

        <span class="category-chip">${escapeHTML(post.category)}</span>
      </div>

      <h2 class="post-title">${escapeHTML(post.title)}</h2>
      <p class="post-body">${escapeHTML(post.content)}</p>

      <div class="post-actions">
        <button class="like-btn ${liked ? "active" : ""}" data-action="like">
          ${liked ? "♥" : "♡"} ${post.likes.length}
        </button>

        <button class="comment-toggle-btn" data-action="toggle-comments">
          💬 ${post.comments.length}
        </button>
      </div>

      <div class="comments-section hidden">
        <h3 class="comments-title">Comments</h3>

        <div class="comments-list">
          ${renderComments(post, data)}
        </div>

        <form class="comment-form" data-action="comment-form">
          <input
            class="comment-input"
            type="text"
            name="comment"
            maxlength="250"
            placeholder="Write a comment..."
          />
          <button class="comment-submit" type="submit">Send</button>
        </form>
      </div>
    </article>
  `;
}

function renderFeed() {
  const data = getAppData();
  const container = document.getElementById("feedContainer");

  const sortedPosts = [...data.posts].sort(
    (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
  );

  container.innerHTML = sortedPosts.map(post => renderPost(post, data)).join("");

  attachPostEvents();
}

/* =========================
   EVENT BINDING
========================= */
function attachPostEvents() {
  const postCards = document.querySelectorAll(".post-card");

  postCards.forEach(card => {
    const postId = card.dataset.postId;
    const likeBtn = card.querySelector('[data-action="like"]');
    const toggleCommentsBtn = card.querySelector('[data-action="toggle-comments"]');
    const commentsSection = card.querySelector(".comments-section");
    const commentForm = card.querySelector('[data-action="comment-form"]');
    const commentInput = card.querySelector(".comment-input");

    likeBtn.addEventListener("click", () => {
      toggleLike(postId);
    });

    toggleCommentsBtn.addEventListener("click", () => {
      commentsSection.classList.toggle("hidden");
    });

    commentForm.addEventListener("submit", event => {
      event.preventDefault();
      addComment(postId, commentInput.value);
    });
  });
}

/* =========================
   DEV HELPER
========================= */
function resetDemoData() {
  localStorage.removeItem(STORAGE_KEY);
  renderFeed();
}

/* =========================
   START
========================= */
document.addEventListener("DOMContentLoaded", () => {
  renderFeed();
});