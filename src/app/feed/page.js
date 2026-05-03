"use client";
// FEED page = global feed, shows every post in newest-first order
import { useEffect, useState, useCallback } from "react";
import Header from "@/components/Header";
import Composer from "@/components/Composer";
import PostCard from "@/components/PostCard";
import SuggestedUsers from "@/components/SuggestedUsers";
import PostTypeFilters from "@/components/PostTypeFilters";
import useRequireAuth from "@/components/useRequireAuth";

export default function FeedPage() {
  const { me, loading } = useRequireAuth();
  const [posts, setPosts] = useState([]);
  const [postsLoading, setPostsLoading] = useState(true);
  const [activeType, setActiveType] = useState("");

  const load = useCallback(async (forcedType) => {
    setPostsLoading(true);

    const pickedType =
      typeof forcedType === "string"
        ? forcedType
        : new URLSearchParams(window.location.search).get("type") || "";

    const url = pickedType
      ? `/api/posts?type=${encodeURIComponent(pickedType)}`
      : "/api/posts";

    const r = await fetch(url);
    if (r.ok) {
      const d = await r.json();
      setPosts(d.posts || []);
    }

    setPostsLoading(false);
  }, []);

  useEffect(() => {
    if (loading) return;

    const pickedType =
      new URLSearchParams(window.location.search).get("type") || "";

    setActiveType(pickedType);
    load(pickedType);
  }, [loading, load]);

  if (loading) return null;

  function removePost(id) {
    setPosts((p) => p.filter((x) => x.id !== id));
  }

  function changeFilter(nextType) {
    const sp = new URLSearchParams(window.location.search);

    if (nextType) sp.set("type", nextType);
    else sp.delete("type");

    const nextUrl = sp.toString()
      ? `${window.location.pathname}?${sp.toString()}`
      : window.location.pathname;

    window.history.replaceState({}, "", nextUrl);
    setActiveType(nextType);
    load(nextType);
  }

  return (
    <>
      <Header me={me} />
      <main className="app-layout">
        <aside className="sidebar-left">
          <div className="widget">
            <div className="widget-title">Menu</div>
            <p className="muted" style={{ fontSize: 13 }}>
              Use the top nav to jump between feed, explore, stats and your profile.
            </p>
          </div>
        </aside>

        <section>
          <Composer onPosted={() => load(activeType)} me={me} />
          <PostTypeFilters activeType={activeType} onChange={changeFilter} />

          <h2
            style={{
              margin: "16px 0 10px",
              fontSize: 14,
              letterSpacing: 2,
              color: "var(--green)",
            }}
          >
            ALL POSTS
          </h2>

          {postsLoading && <div className="card muted">Loading...</div>}

          {!postsLoading && posts.length === 0 && (
            <div className="card muted">No posts match this filter yet.</div>
          )}

          {posts.map((p) => (
            <PostCard
              key={p.id}
              post={p}
              currentUserId={me?.id}
              me={me}
              onDeleted={removePost}
            />
          ))}
        </section>

        <aside className="sidebar-right">
          <SuggestedUsers me={me} />
        </aside>
      </main>
    </>
  );
}
