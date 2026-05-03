"use client";
// renders a single post card. handles like toggle + delete (if i own it).
// guests can SEE everything but trying to like prompts them to login.
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Heart, MessageCircle, Trash2 } from "lucide-react";
import Avatar from "./Avatar";
import { requireLogin } from "./useRequireAuth";

// converts an iso date into something like "3h ago", quick and dirty
function timeAgo(iso) {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 60) return Math.floor(diff) + "s ago";
  if (diff < 3600) return Math.floor(diff / 60) + "m ago";
  if (diff < 86400) return Math.floor(diff / 3600) + "h ago";
  return Math.floor(diff / 86400) + "d ago";
}

export default function PostCard({ post, currentUserId, me, onDeleted }) {
  const router = useRouter();
  // we keep local state for the like count so the UI updates instantly
  const [liked, setLiked] = useState(post.likedByMe);
  const [count, setCount] = useState(post.likeCount);
  const [busy, setBusy] = useState(false);

  // me may be missing on older pages, fallback to currentUserId being truthy
  const meObj = me || (currentUserId ? { id: currentUserId } : null);

  async function toggleLike(e) {
    e.preventDefault();
    if (busy) return;
    if (!requireLogin(meObj, router, "You need to log in to like a post.")) return;
    setBusy(true);
    const res = await fetch(`/api/posts/${post.id}/like`, { method: "POST" });
    if (res.ok) {
      const data = await res.json();
      setLiked(data.liked);
      setCount(data.count); // server returns the FRESH count, no toggle bug
    }
    setBusy(false);
  }

  async function handleDelete(e) {
    e.preventDefault();
    if (!confirm("Delete this post?")) return;
    const res = await fetch(`/api/posts/${post.id}`, { method: "DELETE" });
    if (res.ok && onDeleted) onDeleted(post.id);
  }

  const isMine = currentUserId && currentUserId === post.author.id;

  return (
    <article className="card">
      <div className="post-header">
        <Link href={`/profile/${post.author.id}`}>
          <Avatar user={post.author} />
        </Link>
        <div className="post-meta">
          <span className="post-author">
            <Link href={`/profile/${post.author.id}`}>@{post.author.username}</Link>
            <span className={"badge " + post.type}>{post.type}</span>
          </span>
          <span className="post-time">{timeAgo(post.createdAt)}</span>
        </div>
      </div>

      <Link href={`/post/${post.id}`} style={{ color: "inherit" }}>
        <p className="post-content">{post.content}</p>
      </Link>

      <div className="post-actions">
        <button onClick={toggleLike} className={liked ? "liked" : ""} disabled={busy}>
          <Heart size={16} fill={liked ? "currentColor" : "none"} /> {count}
        </button>
        <Link href={`/post/${post.id}`}>
          <button>
            <MessageCircle size={16} /> {post.commentCount}
          </button>
        </Link>
        {isMine && (
          <button onClick={handleDelete} className="del-btn">
            <Trash2 size={16} /> Delete
          </button>
        )}
      </div>
    </article>
  );
}
