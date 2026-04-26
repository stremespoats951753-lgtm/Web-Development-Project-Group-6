import { useState, useEffect, useRef, useCallback } from 'react';

// ── Helpers ───────────────────────────────────────────────────
function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

function formatTime(dateStr) {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
}

const TYPE_COLORS = {
  update:      { bar: '#00f5a0', text: '#00f5a0' },
  achievement: { bar: '#f5a000', text: '#f5a000' },
  discussion:  { bar: '#7a6fff', text: '#7a6fff' },
};

const TYPE_LABELS = { update: 'UPDATE', achievement: 'ACHIEVEMENT', discussion: 'DISCUSSION' };

// ── Avatar ────────────────────────────────────────────────────
function Avatar({ text, color, size = 'sm' }) {
  const cls = size === 'lg' ? `av-lg ${color}` : `av ${color}`;
  return <div className={cls}>{text || '?'}</div>;
}

// ── Skeleton ──────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div className="skeleton-card">
      <div className="skeleton-line" style={{ height: 14, width: '30%' }} />
      <div className="skeleton-line" style={{ height: 18, width: '70%', marginTop: 12 }} />
      <div className="skeleton-line" style={{ height: 13, width: '100%' }} />
      <div className="skeleton-line" style={{ height: 13, width: '85%' }} />
    </div>
  );
}

// ── Achievement Banner ────────────────────────────────────────
function AchievementBanner({ name }) {
  return (
    <div className="achievement-banner">
      <svg viewBox="0 0 24 24" fill="none" stroke="#f5a000" strokeWidth="2"
        style={{ width: 20, height: 20, flexShrink: 0 }}>
        <path d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
      </svg>
      <div>
        <div className="achievement-label">ACHIEVEMENT UNLOCKED</div>
        <div className="achievement-name">{name}</div>
      </div>
    </div>
  );
}

// ── Post Card ─────────────────────────────────────────────────
function PostCard({ post, onLike, onOpen }) {
  return (
    <div className={`post-card ${post.type}`} onClick={() => onOpen(post.id)}>
      <div className="card-body">
        <div className="card-meta">
          <Avatar text={post.author?.avatarText} color={post.author?.avatarColor} />
          <div>
            <div className="card-username">
              {post.author?.username}
              <span className="game-tag">{post.game}</span>
            </div>
            <div className="card-timestamp">{formatDate(post.createdAt)}</div>
          </div>
          <span className="type-badge">{TYPE_LABELS[post.type] || post.type}</span>
        </div>

        <div className="card-title">{post.title}</div>
        {post.hasAchievement && <AchievementBanner name={post.achievementName} />}
        <div className="card-content">{post.content}</div>
      </div>

      <div className="card-actions" onClick={e => e.stopPropagation()}>
        <button
          className={`action-btn ${post.liked ? 'liked' : ''}`}
          onClick={() => onLike(post.id)}
        >
          ♥ {post.likes ?? 0}
        </button>
        <button className="action-btn" onClick={() => onOpen(post.id)}>
          💬 {post.commentCount ?? 0}
        </button>
        <span className="read-more" onClick={() => onOpen(post.id)}>READ MORE →</span>
      </div>
    </div>
  );
}

// ── Modal ─────────────────────────────────────────────────────
function Modal({ post, onClose, onLike, currentUserId, onCommentPosted }) {
  const [commentText, setCommentText] = useState('');
  const [submitting, setSubmitting]   = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    if (post) setTimeout(() => inputRef.current?.focus(), 100);
  }, [post]);

  if (!post) return null;
  const color = TYPE_COLORS[post.type] || TYPE_COLORS.update;

  async function handleSubmitComment() {
    const text = commentText.trim();
    if (!text || submitting) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/posts/${post.id}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ authorId: currentUserId || 1, text }),
      });
      if (res.ok) {
        const comment = await res.json();
        setCommentText('');
        onCommentPosted(comment);
      }
    } catch (e) {
      console.error('Comment error:', e);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      className="modal-overlay open"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="modal">
        <div className="modal-top-bar" style={{ background: color.bar }} />

        <div className="modal-header">
          <Avatar text={post.author?.avatarText} color={post.author?.avatarColor} size="lg" />
          <div>
            <div style={{ fontSize: 14, fontWeight: 'bold' }}>
              {post.author?.username} · {post.game}
            </div>
            <div style={{ fontSize: 11, color: '#555' }}>{formatDate(post.createdAt)}</div>
          </div>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="modal-body">
          <div className="modal-title" style={{ color: color.text }}>{post.title}</div>
          {post.hasAchievement && <AchievementBanner name={post.achievementName} />}
          <div className="modal-text">{post.content}</div>

          <div className="modal-actions">
            <button
              className={`modal-action-btn ${post.liked ? 'liked' : ''}`}
              onClick={() => onLike(post.id)}
            >
              ♥ <span>{post.likes ?? 0}</span> Likes
            </button>
            <button
              className="modal-action-btn"
              onClick={() => inputRef.current?.focus()}
            >
              💬 Comment
            </button>
          </div>
        </div>

        <div className="comments-section">
          <div className="comments-header">
            COMMENTS <span>({(post.comments || []).length})</span>
          </div>

          <div className="comment-input-row">
            <textarea
              ref={inputRef}
              rows={2}
              placeholder="Join the discussion..."
              value={commentText}
              onChange={e => setCommentText(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmitComment();
                }
              }}
            />
            <button
              className="btn-comment"
              onClick={handleSubmitComment}
              disabled={!commentText.trim() || submitting}
            >
              {submitting ? '...' : 'POST'}
            </button>
          </div>

          <div>
            {(post.comments || []).map(c => (
              <div key={c.id} className="comment-item">
                <Avatar text={c.author?.avatarText} color={c.author?.avatarColor} />
                <div className="comment-bubble">
                  <div className="comment-top">
                    <span className="comment-user">{c.author?.username}</span>
                    <span className="comment-time">{formatTime(c.createdAt)}</span>
                  </div>
                  <div className="comment-text">{c.text}</div>
                  <div className="comment-likes">♥ {c.likes ?? 0}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Error Banner ──────────────────────────────────────────────
function ErrorBanner({ message, onRetry }) {
  return (
    <div style={{
      background: '#2a1a1a', border: '1px solid #5a1a2a',
      borderRadius: 8, padding: '20px 24px', marginBottom: 14,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
    }}>
      <div>
        <div style={{ color: '#f50057', fontWeight: 'bold', marginBottom: 4 }}>
          ⚠ Could not load posts
        </div>
        <div style={{ color: '#aaa', fontSize: 13 }}>{message}</div>
      </div>
      <button
        onClick={onRetry}
        style={{
          background: '#00f5a0', color: '#000', border: 'none',
          borderRadius: 6, padding: '7px 16px', cursor: 'pointer',
          fontWeight: 'bold', fontSize: 13, whiteSpace: 'nowrap',
        }}
      >
        Retry
      </button>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────
export default function Home() {
  const [posts, setPosts]             = useState([]);
  const [loading, setLoading]         = useState(true);
  const [loadError, setLoadError]     = useState(null);
  const [filter, setFilter]           = useState('all');
  const [currentUser, setCurrentUser] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [modalPost, setModalPost]     = useState(null);
  const [toast, setToast]             = useState({ msg: '', show: false, error: false });

  // Create post form
  const [postTitle,   setPostTitle]   = useState('');
  const [postContent, setPostContent] = useState('');
  const [postGame,    setPostGame]    = useState('');
  const [postType,    setPostType]    = useState('update');
  const [posting,     setPosting]     = useState(false);

  const createPostRef = useRef(null);

  // ── Toast ────────────────────────────────────────────────────
  const showToast = useCallback((msg, error = false) => {
    setToast({ msg, show: true, error });
    setTimeout(() => setToast(t => ({ ...t, show: false })), 3000);
  }, []);

  // ── Load user + leaderboard on mount ─────────────────────────
  useEffect(() => {
    fetch('/api/users/me')
      .then(r => r.ok ? r.json() : null)
      .then(u => { if (u && u.id) setCurrentUser(u); })
      .catch(e => console.error('Could not load user:', e));

    fetch('/api/users/leaderboard?limit=4')
      .then(r => r.ok ? r.json() : [])
      .then(data => { if (Array.isArray(data)) setLeaderboard(data); })
      .catch(e => console.error('Could not load leaderboard:', e));
  }, []);

  // ── Load posts ───────────────────────────────────────────────
  const loadPosts = useCallback(async (type) => {
    setLoading(true);
    setLoadError(null);
    try {
      const userId = currentUser?.id ? `&userId=${currentUser.id}` : '';
      const url = `/api/posts?type=${type || 'all'}${userId}`;
      const res = await fetch(url);

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Server error ${res.status}: ${text.slice(0, 120)}`);
      }

      const data = await res.json();

      if (!Array.isArray(data)) {
        throw new Error('Unexpected response from server. Is the database seeded?');
      }

      setPosts(data);
    } catch (err) {
      console.error('loadPosts error:', err);
      setLoadError(err.message || 'Unknown error. Check your terminal for details.');
      setPosts([]);
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
    loadPosts(filter);
  }, [filter, currentUser]);

  // ── Filter ────────────────────────────────────────────────────
  function changeFilter(newFilter) {
    setFilter(newFilter);
  }

  // ── Like ──────────────────────────────────────────────────────
  async function handleLike(postId) {
    const userId = currentUser?.id || 1;
    try {
      const res = await fetch(`/api/posts/${postId}/like`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });
      if (!res.ok) throw new Error('Like failed');
      const { liked, likeCount } = await res.json();

      const updater = p => p.id === postId ? { ...p, liked, likes: likeCount } : p;
      setPosts(prev => prev.map(updater));
      if (modalPost?.id === postId) setModalPost(prev => ({ ...prev, liked, likes: likeCount }));
    } catch (err) {
      showToast('Could not update like. Try again.', true);
    }
  }

  // ── Open modal ────────────────────────────────────────────────
  async function openModal(postId) {
    try {
      const res = await fetch(`/api/posts/${postId}`);
      if (!res.ok) throw new Error('Failed to load post');
      const data = await res.json();
      const feedPost = posts.find(p => p.id === postId);
      setModalPost({ ...data, liked: feedPost?.liked ?? false, likes: feedPost?.likes ?? data.likes });
      document.body.style.overflow = 'hidden';
    } catch (err) {
      showToast('Could not open post.', true);
    }
  }

  function closeModal() {
    setModalPost(null);
    document.body.style.overflow = '';
  }

  // ── Comment posted ────────────────────────────────────────────
  function handleCommentPosted(comment) {
    setModalPost(prev => ({
      ...prev,
      comments: [...(prev.comments || []), comment],
    }));
    setPosts(prev =>
      prev.map(p =>
        p.id === modalPost?.id
          ? { ...p, commentCount: (p.commentCount || 0) + 1 }
          : p
      )
    );
    showToast('Comment posted!');
  }

  // ── Submit post ───────────────────────────────────────────────
  async function handleSubmitPost() {
    if (!postTitle.trim()) {
      showToast('Please enter a title.', true);
      return;
    }
    if (!postContent.trim()) {
      showToast('Please enter some content.', true);
      return;
    }
    setPosting(true);
    try {
      const res = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          authorId:        currentUser?.id || 1,
          type:            postType,
          title:           postTitle.trim(),
          content:         postContent.trim(),
          game:            postGame.trim() || 'General',
          hasAchievement:  postType === 'achievement',
          achievementName: postType === 'achievement' ? postTitle.trim() : null,
        }),
      });

      if (res.ok) {
        setPostTitle('');
        setPostContent('');
        setPostGame('');
        setPostType('update');
        showToast('🎮 Post published!');
        await loadPosts(filter);
      } else {
        const body = await res.json().catch(() => ({}));
        showToast(body.error || 'Failed to publish post.', true);
      }
    } catch (err) {
      showToast('Network error. Is the server running?', true);
    } finally {
      setPosting(false);
    }
  }

  function scrollToCreate() {
    createPostRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    setTimeout(() => {
      const input = createPostRef.current?.querySelector('input');
      if (input) input.focus();
    }, 400);
  }

  // ── Coming soon handler ───────────────────────────────────────
  function comingSoon(feature) {
    showToast(`🚧 ${feature} — Coming Soon!`, false);
  }

  // ── ESC to close modal ────────────────────────────────────────
  useEffect(() => {
    function onKey(e) { if (e.key === 'Escape' && modalPost) closeModal(); }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [modalPost]);

  function rankClass(i) {
    return ['gold-pos', 'silver-pos', 'bronze-pos', 'other-pos'][i] || 'other-pos';
  }

  // ─────────────────────────────────────────────────────────────
  return (
    <>
      {/* ── HEADER ────────────────────────────────────────────── */}
      <header>
        <div className="logo">GAMER<span>FEED</span></div>
        <input
          className="header-search"
          type="text"
          placeholder="Search — coming soon..."
          disabled
          style={{ cursor: 'not-allowed', opacity: 0.45 }}
        />
        <button className="btn-post" onClick={scrollToCreate}>+ POST</button>
        <div
          className="avatar-chip"
          title={currentUser?.displayName || 'DrMucahid'}
        >
          {currentUser?.avatarText || 'DMK'}
        </div>
      </header>

      {/* ── LAYOUT ────────────────────────────────────────────── */}
      <div className="app-layout">

        {/* ── LEFT SIDEBAR ──────────────────────────────────── */}
        <aside className="sidebar-left">
          <div className="nav-label">MAIN</div>

          <div
            className={`nav-item clickable ${filter === 'all' ? 'active' : ''}`}
            onClick={() => changeFilter('all')}
          >
            📋 Feed
          </div>
          <div
            className={`nav-item clickable ${filter === 'update' ? 'active' : ''}`}
            onClick={() => changeFilter('update')}
          >
            🔥 Updates
          </div>
          <div
            className={`nav-item clickable ${filter === 'achievement' ? 'active' : ''}`}
            onClick={() => changeFilter('achievement')}
          >
            🏆 Achievements
          </div>
          <div
            className={`nav-item clickable ${filter === 'discussion' ? 'active' : ''}`}
            onClick={() => changeFilter('discussion')}
          >
            💬 Discussion
          </div>

          <div className="nav-label">YOU</div>
          <div
            className="nav-item clickable"
            onClick={() => comingSoon('My Profile')}
            style={{ opacity: 0.6 }}
          >
            👤 My Profile
          </div>
          <div
            className="nav-item clickable"
            onClick={() => comingSoon('My Achievements')}
            style={{ opacity: 0.6 }}
          >
            🏅 My Achievements
          </div>
          <div
            className="nav-item clickable"
            onClick={() => comingSoon('Saved Posts')}
            style={{ opacity: 0.6 }}
          >
            🔖 Saved Posts
          </div>

          <div className="nav-label">GAMES</div>
          <div
            className="nav-item clickable"
            onClick={() => comingSoon('Browse Games')}
            style={{ opacity: 0.6 }}
          >
            🎮 Browse Games
          </div>
        </aside>

        {/* ── MAIN CONTENT ──────────────────────────────────── */}
        <main className="main-content">

          {/* CREATE POST */}
          <div className="create-post" id="create-post-box" ref={createPostRef}>
            <div className="create-post-row">
              <div className="post-avatar">
                {currentUser?.avatarText || 'DMK'}
              </div>
              <div className="create-post-inputs">
                <input
                  type="text"
                  placeholder="Post title..."
                  maxLength={100}
                  value={postTitle}
                  onChange={e => setPostTitle(e.target.value)}
                />
                <input
                  type="text"
                  placeholder="Game name (optional)..."
                  maxLength={60}
                  value={postGame}
                  onChange={e => setPostGame(e.target.value)}
                />
                <div className="type-chips">
                  {['update', 'achievement', 'discussion'].map(t => (
                    <button
                      key={t}
                      className={`type-chip ${t} ${postType === t ? 'selected' : ''}`}
                      onClick={() => setPostType(t)}
                    >
                      {t.toUpperCase()}
                    </button>
                  ))}
                </div>
                <textarea
                  rows={3}
                  placeholder="What's happening in your game world?"
                  value={postContent}
                  onChange={e => setPostContent(e.target.value)}
                />
                <div className="post-footer">
                  <button
                    className="btn-cancel"
                    onClick={() => {
                      setPostTitle('');
                      setPostContent('');
                      setPostGame('');
                      setPostType('update');
                    }}
                  >
                    CLEAR
                  </button>
                  <button
                    className="btn-submit"
                    onClick={handleSubmitPost}
                    disabled={posting}
                  >
                    {posting ? 'POSTING...' : 'POST IT'}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* FEED FILTERS */}
          <div className="feed-filters">
            {[
              { key: 'all',         label: 'ALL' },
              { key: 'update',      label: 'UPDATES' },
              { key: 'achievement', label: 'ACHIEVEMENTS' },
              { key: 'discussion',  label: 'DISCUSSIONS' },
            ].map(f => (
              <button
                key={f.key}
                className={`feed-filter ${filter === f.key ? 'active' : ''}`}
                onClick={() => changeFilter(f.key)}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* FEED */}
          {loading ? (
            <><SkeletonCard /><SkeletonCard /><SkeletonCard /></>
          ) : loadError ? (
            <ErrorBanner
              message={loadError}
              onRetry={() => loadPosts(filter)}
            />
          ) : posts.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-title">No posts found</div>
              <div className="empty-state-sub">
                {filter === 'all'
                  ? 'The database may not be seeded yet. Run: node prisma/seed.js'
                  : `No ${filter} posts yet — be the first!`}
              </div>
            </div>
          ) : (
            posts.map(post => (
              <PostCard
                key={post.id}
                post={post}
                onLike={handleLike}
                onOpen={openModal}
                currentUserId={currentUser?.id}
              />
            ))
          )}
        </main>

        {/* ── RIGHT SIDEBAR ──────────────────────────────────── */}
        <aside className="sidebar-right">

          <div className="widget">
            <div className="widget-title">🔥 TRENDING</div>
            {[
              { rank: 1, tag: 'GAME TAG',    name: '#Elden Ring DLC',  count: '2.4K posts' },
              { rank: 2, tag: 'ACHIEVEMENT', name: '#PlatinumHunters', count: '1.8K posts' },
              { rank: 3, tag: 'DISCUSSION',  name: '#RPGDebate2026',   count: '1.1K posts' },
              { rank: 4, tag: 'GAME TAG',    name: '#CyberpunkUpdate', count: '890 posts'  },
            ].map(t => (
              <div className="trending-item" key={t.rank}>
                <span className="trending-rank">{t.rank}</span>
                <div>
                  <div className="trending-tag">{t.tag}</div>
                  <div className="trending-name">{t.name}</div>
                  <div className="trending-count">{t.count}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="widget">
            <div className="widget-title">🏆 TOP PLAYERS</div>
            {leaderboard.length > 0 ? (
              leaderboard.map((u, i) => (
                <div className="leader-item" key={u.id}>
                  <span className={`leader-pos ${rankClass(i)}`}>{i + 1}</span>
                  <Avatar text={u.avatarText} color={u.avatarColor} />
                  <span style={{ fontSize: 13 }}>{u.username}</span>
                  <span className="leader-xp">{(u.xp / 1000).toFixed(1)}K XP</span>
                </div>
              ))
            ) : (
              <div style={{ color: '#555', fontSize: 13 }}>Loading players...</div>
            )}
          </div>

        </aside>
      </div>

      {/* ── MODAL ─────────────────────────────────────────────── */}
      {modalPost && (
        <Modal
          post={modalPost}
          onClose={closeModal}
          onLike={handleLike}
          currentUserId={currentUser?.id}
          onCommentPosted={handleCommentPosted}
        />
      )}

      {/* ── TOAST ─────────────────────────────────────────────── */}
      <div className={`toast ${toast.show ? 'show' : ''} ${toast.error ? 'error' : ''}`}>
        {toast.msg}
      </div>
    </>
  );
}