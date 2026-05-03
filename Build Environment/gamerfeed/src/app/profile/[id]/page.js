"use client";
// Profile page for ANY user (not just me). The follow button + edit button
// only shows when its appropriate. Fixes the "profile only works for me" bug.
import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import Header from "@/components/Header";
import Avatar from "@/components/Avatar";
import PostCard from "@/components/PostCard";
import useRequireAuth from "@/components/useRequireAuth";

export default function ProfilePage() {
  const { me, loading } = useRequireAuth();
  const params = useParams();
  // bug fix: params is the whole object, we need params.id otherwise Number(obj) is NaN and the page loads forever
  const id = Number(params.id);

  const [info, setInfo] = useState(null); // { user, followers, following, isFollowing, isMe }
  const [posts, setPosts] = useState([]);

  const load = useCallback(async () => {
    const [r1, r2] = await Promise.all([
      fetch(`/api/users/${id}`),
      fetch(`/api/users/${id}/posts`),
    ]);
    if (r1.ok) setInfo(await r1.json());
    if (r2.ok) setPosts((await r2.json()).posts || []);
  }, [id]);

  useEffect(() => { if (!loading) load(); }, [loading, load]);

  if (loading) return null;
  if (!info) return (<><Header me={me} /><main className="app-layout"><div className="card muted">Loading...</div></main></>);
  if (!info.user) return (<><Header me={me} /><main className="app-layout"><div className="card">User not found</div></main></>);

  async function toggleFollow() {
    if (!me) { if (confirm("Log in to follow users?")) location.href = "/login"; return; }
    const method = info.isFollowing ? "DELETE" : "POST";
    await fetch(`/api/users/${id}/follow`, { method });
    load(); // re-fetch to get fresh counts
  }

  return (
    <>
      <Header me={me} />
      <main className="app-layout">
        <aside className="sidebar-left">
          <div className="widget">
            <div className="widget-title">About</div>
            <p className="muted" style={{ fontSize: 13 }}>
              {info.user.bio || "No bio yet."}
            </p>
          </div>
        </aside>

        <section>
          <div className="card profile-cover">
            <Avatar user={info.user} size="lg" />
            <div style={{ flex: 1 }}>
              <h1 style={{ fontSize: 22 }}>@{info.user.username}</h1>
              <div className="profile-stats">
                <span><b>{posts.length}</b> posts</span>
                <span><b>{info.followers}</b> followers</span>
                <span><b>{info.following}</b> following</span>
              </div>
            </div>
            <div className="vstack">
              {info.isMe ? (
                <Link href="/profile/edit"><button className="btn btn-ghost">Edit profile</button></Link>
              ) : (
                <button
                  className={"btn " + (info.isFollowing ? "btn-ghost" : "")}
                  onClick={toggleFollow}
                >
                  {info.isFollowing ? "Unfollow" : "Follow"}
                </button>
              )}
            </div>
          </div>

          <h2 style={{ margin: "16px 0 10px", fontSize: 14, letterSpacing: 2, color: "var(--green)" }}>
            POSTS
          </h2>
          {posts.length === 0 && <div className="card muted">No posts yet.</div>}
          {posts.map((p) => (
            <PostCard
              key={p.id}
              post={p}
              currentUserId={me?.id}
              me={me}
              onDeleted={(pid) => setPosts((arr) => arr.filter((x) => x.id !== pid))}
            />
          ))}
        </section>

        <aside className="sidebar-right">
          <div className="widget">
            <div className="widget-title">Joined</div>
            <p className="muted" style={{ fontSize: 13 }}>
              {new Date(info.user.createdAt).toLocaleDateString()}
            </p>
          </div>
        </aside>
      </main>
    </>
  );
}
