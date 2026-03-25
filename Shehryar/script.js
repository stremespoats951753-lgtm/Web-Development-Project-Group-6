
let currentFilter = 'all';
let selectedType = 'update';
let currentModalPostId = null;
let feedPosts = [];
let postIdCounter = 100;


const defaultPosts = [
  {
    id: 1, type: 'achievement',
    username: 'NightKira', avatarClass: 'gold', avatarText: 'NK',
    game: 'Elden Ring', timestamp: 'Mar 15, 2026 at 14:32',
    title: 'Finally Got the Platinum!',
    content: 'After 200+ hours, I finally got the Platinum Trophy for Elden Ring. The hardest part was the Malenia fight — took me 47 attempts. If anyone is struggling, focus on dodging the scarlet rot and learn her second phase timing. Worth every second.',
    likes: 284, liked: false,
    hasAchievement: true, achievementName: 'Elden Ring Platinum',
    comments: [
      { id: 1, user: 'AxelRift',  avatarClass: 'green',  avatarText: 'AX', text: 'Congrats! Malenia is brutal. Did you use the bleed build?',               time: '14:45', likes: 12 },
      { id: 2, user: 'VoidX',     avatarClass: 'purple', avatarText: 'VX', text: 'Insane achievement. 47 attempts on Malenia means you were determined.',    time: '15:01', likes: 8  }
    ]
  },
  {
    id: 2, type: 'update',
    username: 'AxelRift', avatarClass: 'green', avatarText: 'AX',
    game: 'Cyberpunk 2077', timestamp: 'Mar 15, 2026 at 12:10',
    title: 'New 2.5 Patch Changes Everything',
    content: 'Just went through the new Cyberpunk 2077 patch 2.5 patch notes and this is genuinely exciting. The new vehicle combat system is completely revamped, crafting has been simplified, and there are 3 new gigs in Dogtown. Night City feels alive again.',
    likes: 142, liked: false, hasAchievement: false,
    comments: [
      { id: 1, user: 'StormFang', avatarClass: 'red', avatarText: 'SF', text: 'The vehicle combat was so clunky before. Glad they finally fixed it.', time: '12:30', likes: 5 }
    ]
  },
  {
    id: 3, type: 'discussion',
    username: 'VoidX', avatarClass: 'purple', avatarText: 'VX',
    game: 'General', timestamp: 'Mar 15, 2026 at 09:55',
    title: 'Are Live Service Games Killing Single Player?',
    content: 'Hot take: The massive success of Elden Ring, BG3, and Astro Bot proves that gamers WANT well-crafted single player experiences. Yet every major publisher keeps throwing money at live service titles that fail within 6 months. When will the industry learn?\n\nDropping your thoughts below.',
    likes: 391, liked: false, hasAchievement: false,
    comments: [
      { id: 1, user: 'NightKira', avatarClass: 'gold',   avatarText: 'NK', text: 'Completely agree. Players will pay full price for a great SP game.',                           time: '10:15', likes: 34 },
      { id: 2, user: 'AxelRift',  avatarClass: 'green',  avatarText: 'AX', text: 'Live service can work when done right (Deep Rock Galactic) but most studios chase trends not quality.', time: '10:42', likes: 21 },
      { id: 3, user: 'StormFang', avatarClass: 'red',    avatarText: 'SF', text: 'Both can coexist. The problem is executives, not the format.',                                  time: '11:03', likes: 18 }
    ]
  },
  {
    id: 4, type: 'update',
    username: 'StormFang', avatarClass: 'red', avatarText: 'SF',
    game: 'Helldivers 2', timestamp: 'Mar 14, 2026 at 22:18',
    title: 'Super Earth Under Attack — Major Order Active',
    content: 'The new Major Order just dropped and it is intense. We need to liberate 5 planets in 48 hours to unlock the new Patriot Exosuit stratagem. Current success rate: 34%. We need every Helldiver on deck right now. FOR SUPER EARTH.',
    likes: 217, liked: false, hasAchievement: false, comments: []
  }
];


function init() {
  const saved = localStorage.getItem('posts');
  
  if (saved) {
    feedPosts = JSON.parse(saved);
  } else {
    feedPosts = [...defaultPosts];
    localStorage.setItem('posts', JSON.stringify(feedPosts));
  }
  renderFeed();
}


function renderFeed() {
  const container = document.getElementById('feed-container');
  container.innerHTML = '';
  let posts;
  if (currentFilter === 'all') {
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
  const card = document.createElement('div');
  card.className = `post-card ${post.type}`;
  card.onclick = () => openModal(post.id);

  let achievementHTML = '';
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

  const typeLabels = { update: 'UPDATE', achievement: 'ACHIEVEMENT', discussion: 'DISCUSSION' };

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
      <button class="action-btn ${post.liked ? 'liked' : ''}" onclick="toggleLike(${post.id})">
        ♥ ${post.likes}
      </button>
      <button class="action-btn" onclick="openModal(${post.id})">
        💬 ${post.comments.length}
      </button>
      <span class="read-more" onclick="openModal(${post.id})">READ MORE →</span>
    </div>`;

  return card;
}


function toggleLike(postId) {
    const post = feedPosts.find(p => p.id === postId);
    if (post === null) {
        return;
    }

    if (post.liked === true) {
        post.liked = false;
    }else {
        post.liked = true;
    }

    if (post.liked === true) {
        post.likes = post.likes + 1;
    }else {
        post.likes = post.likes - 1;
    }

    renderFeed();
    if (currentModalPostId === postId) populateModal(post);
}


function setFilter(filter, el) {
  currentFilter = filter;
  document.querySelectorAll('.feed-filter').forEach(f => f.classList.remove('active'));
  if (el && el.classList) el.classList.add('active');
  renderFeed();
}

function selectType(type, el) {
  selectedType = type;
  document.querySelectorAll('.type-chip').forEach(c => c.classList.remove('selected'));
  el.classList.add('selected');
}


function submitPost() {
  const title = document.getElementById('post-title').value;
  const content = document.getElementById('post-content').value;
  if (!title || !content) 
    {
         showToast('Please fill in both title and content.'); 
         return; 
    }

  feedPosts.unshift({
    id: ++postIdCounter, type: selectedType,
    username: 'GamerX', avatarClass: 'green', avatarText: 'DKM',
    game: 'Your Game',
    timestamp: new Date().toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
    title, content, likes: 0, liked: false, comments: [],
    hasAchievement: selectedType === 'achievement',
    achievementName: selectedType === 'achievement' ? title : ''
  });
    
  localStorage.setItem('posts', JSON.stringify(feedPosts));


  clearForm();
  renderFeed();
  showToast('Post published!');
}


function clearForm() {
  document.getElementById('post-title').value = '';
  document.getElementById('post-content').value = '';
}


function scrollToCreate() {
  document.getElementById('create-post-box').scrollIntoView({ behavior: 'smooth', block: 'center' });
  document.getElementById('post-title').focus();
}


function openModal(postId) {
  const post = feedPosts.find(p => p.id === postId);
  if (!post) return;
  currentModalPostId = postId;
  populateModal(post);
  renderComments(post);
  document.getElementById('modal-overlay').classList.add('open');
  document.body.style.overflow = 'hidden';
}


function populateModal(post) {
  const mainColor = '#00ff33'; 
  document.getElementById('modal-top-bar').style.background = mainColor;

  const av = document.getElementById('modal-avatar');
  av.style.cssText = `
    width:44px;
    height:44px;
    border-radius:6px;
    display:flex;
    align-items:center;
    justify-content:center;
    font-weight:bold;
    background:#1a5a3a;
    color:${mainColor};
  `;
  av.textContent = post.avatarText;

  document.getElementById('modal-username').textContent =
    `${post.username} · ${post.game}`;

  document.getElementById('modal-timestamp').textContent = post.timestamp;
  document.getElementById('modal-title').textContent = post.title;
  document.getElementById('modal-title').style.color = mainColor;
  document.getElementById('modal-content').textContent = post.content;
  document.getElementById('modal-likes-count').textContent = post.likes;

  const btn = document.getElementById('modal-like-btn');
  btn.classList.toggle('liked', post.liked);
}

function renderComments(post) {
  const list = document.getElementById('comments-list');
  list.innerHTML = '';

  document.getElementById('comments-count-label').textContent = `(${post.comments.length})`;

  const mainColor = '#00f5a0'; 

  post.comments.forEach(c => {
    const item = document.createElement('div');
    item.className = 'comment-item';

    item.innerHTML = `
      <div style="
        width:32px;
        height:32px;
        border-radius:4px;
        display:flex;
        align-items:center;
        justify-content:center;
        font-size:12px;
        font-weight:bold;
        flex-shrink:0;
        background:#1a5a3a;
        color:${mainColor};
      ">
        ${c.avatarText}
      </div>
      <div class="comment-bubble">
        <div class="comment-top">
          <span class="comment-user">${c.user}</span>
          <span class="comment-time">${c.time}</span>
        </div>

        <div class="comment-text">${c.text}</div>

        <div class="comment-likes" style="color:${mainColor}">
          ♥ ${c.likes}
        </div>
      </div>
    `;

    list.appendChild(item);
  });
}


function closeModal() {
  document.getElementById('modal-overlay').classList.remove('open');
  document.body.style.overflow = '';
  currentModalPostId = null;
  document.getElementById('comment-input').value = '';
}


function handleOverlayClick(e) {
  if (e.target === document.getElementById('modal-overlay'))closeModal();
}


function modalToggleLike() {
  if (currentModalPostId) toggleLike(currentModalPostId);
}


function submitComment() {
  if (!currentModalPostId) return;
  const input = document.getElementById('comment-input');
  const text = input.value.trim();
  if (!text) return;

  const post = feedPosts.find(p => p.id === currentModalPostId);
  if (!post) return;

  post.comments.push({
    id: Date.now(),
    user: 'GamerX', avatarClass: 'green', avatarText: 'GX',
    text,
    time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
    likes: 0
  });

  input.value = '';
  renderComments(post);
  renderFeed();
  showToast('Comment posted!');
}


function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2800);
}


document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeModal();
});

init();