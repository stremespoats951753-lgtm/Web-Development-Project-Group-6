"use client";
// single post page: shows the post + all its comments + add comment box
// also lets the comment owner delete their own comments
import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import { Trash2 } from "lucide-react";
import Header from "@/components/Header";
import PostCard from "@/components/PostCard";
import Avatar from "@/components/Avatar";
import useRequireAuth from "@/components/useRequireAuth";

export default function PostPage() {
  const { me, loading } = useRequireAuth();
  const params = useParams();
  const id = Number(params.id);
  const nid = Number(id);

  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    const [r1, r2] = await Promise.all([
      fetch(`/api/posts/${id}`),
      fetch(`/api/posts/${id}/comments`),
    ]);
    if (r1.ok) setPost((await r1.json()).post);
    if (r2.ok) setComments((await r2.json()).comments || []);
  }, [id]);

  useEffect(() => { if (!loading) load(); }, [loading, load]);

  if (loading) return null;

  async function addComment(e) {
    e.preventDefault();
    if (!text.trim() || busy) return;
    if (!me) { if (confirm("Log in to comment?")) location.href = "/login"; return; }
    setBusy(true);
    const res = await fetch(`/api/posts/${id}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: text }),
    });
    setBusy(false);
    if (res.ok) { setText(""); load(); }
  }

  async function delComment(cid) {
    if (!confirm("Delete this comment?")) return;
    const res = await fetch(`/api/comments/${cid}`, { method: "DELETE" });
    if (res.ok) setComments((c) => c.filter((x) => x.id !== cid));
  }

  return (
    <>
      <Header me={me} />
      <main className="app-layout" style={{ gridTemplateColumns: "1fr" }}>
        <section style={{ maxWidth: 700, margin: "0 auto", width: "100%" }}>
          {post ? (
            <PostCard post={post} currentUserId={me?.id} me={me} onDeleted={() => history.back()} />
          ) : (
            <div className="card muted">Loading post...</div>
          )}

          <div className="card">
            <div className="widget-title">Comments ({comments.length})</div>
            <form onSubmit={addComment} className="hstack" style={{ marginBottom: 12 }}>
              <input
                className="input"
                placeholder="Add a comment..."
                value={text}
                onChange={(e) => setText(e.target.value)}
              />
              <button className="btn" disabled={busy || !text.trim()}>Send</button>
            </form>
            {comments.length === 0 && <div className="muted">Be the first to comment.</div>}
            {comments.map((c) => (
              <div key={c.id} className="comment">
                <Avatar user={c.author} size="sm" />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13 }}>
                    <b>@{c.author.username}</b>{" "}
                    <span className="muted" style={{ fontSize: 11 }}>
                      {new Date(c.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <div style={{ fontSize: 14 }}>{c.content}</div>
                </div>
                {me && c.authorId === me.id && (
                  <button
                    onClick={() => delComment(c.id)}
                    title="Delete"
                    style={{ background: "transparent", border: "none", color: "var(--danger)" }}
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            ))}
          </div>
        </section>
      </main>
    </>
  );
}
