"use client";
// EXPLORE page, this is where you discover new people + see all posts
// includes a search box (fixes the "no way to find users" feedback)
import { useEffect, useState } from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import Header from "@/components/Header";
import PostCard from "@/components/PostCard";
import Avatar from "@/components/Avatar";
import useRequireAuth from "@/components/useRequireAuth";

export default function ExplorePage() {
  const { me, loading } = useRequireAuth();
  const [q, setQ] = useState("");
  const [users, setUsers] = useState([]);
  const [posts, setPosts] = useState([]);
  const [typeFilter, setTypeFilter] = useState("");

  // load all posts whenever the type filter changes
  useEffect(() => {
    const url = typeFilter ? `/api/posts?type=${typeFilter}` : "/api/posts";
    fetch(url).then((r) => r.json()).then((d) => setPosts(d.posts || []));
  }, [typeFilter]);

  // search users with a small debounce so we dont hammer the api on every key
  useEffect(() => {
    const t = setTimeout(() => {
      if (!q.trim()) { setUsers([]); return; }
      fetch(`/api/users/search?q=${encodeURIComponent(q)}`)
        .then((r) => r.json())
        .then((d) => setUsers(d.users || []));
    }, 250);
    return () => clearTimeout(t);
  }, [q]);

  if (loading) return null;

  return (
    <>
      <Header me={me} />
      <main className="app-layout">
        <aside className="sidebar-left">
          <div className="widget">
            <div className="widget-title">Filter posts</div>
            <div className="vstack">
              {["", "update", "achievement", "discussion"].map((t) => (
                <button
                  key={t || "all"}
                  className={"btn " + (typeFilter === t ? "" : "btn-ghost")}
                  onClick={() => setTypeFilter(t)}
                >
                  {t || "all"}
                </button>
              ))}
            </div>
          </div>
        </aside>

        <section>
          <div className="card">
            <div className="hstack">
              <Search size={18} />
              <input
                className="input"
                placeholder="Search users by name or bio..."
                value={q}
                onChange={(e) => setQ(e.target.value)}
              />
            </div>
            {q.trim() && (
              <div className="mt-4">
                {users.length === 0 && <div className="muted">No users match.</div>}
                {users.map((u) => (
                  <div key={u.id} className="user-row">
                    <Link href={`/profile/${u.id}`}><Avatar user={u} /></Link>
                    <div className="meta">
                      <div className="u">
                        <Link href={`/profile/${u.id}`}>@{u.username}</Link>
                      </div>
                      <div className="b">{u.bio || ""}</div>
                    </div>
                    <Link href={`/profile/${u.id}`}>
                      <button className="btn">View</button>
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>

          <h2 style={{ margin: "16px 0 10px", fontSize: 14, letterSpacing: 2, color: "var(--green)" }}>
            ALL POSTS {typeFilter ? `(${typeFilter})` : ""}
          </h2>
          {posts.length === 0 && <div className="card muted">No posts to show.</div>}
          {posts.map((p) => (
            <PostCard key={p.id} post={p} currentUserId={me?.id} me={me} />
          ))}
        </section>

        <aside className="sidebar-right">
          <div className="widget">
            <div className="widget-title">Tip</div>
            <p className="muted" style={{ fontSize: 13 }}>
              Search by username to find specific players. The list is filterd by the
              database so it stays fast even with lots of users.
            </p>
          </div>
        </aside>
      </main>
    </>
  );
}
