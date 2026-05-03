"use client";
// following feed page, only for signed-in users
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import Composer from "@/components/Composer";
import PostCard from "@/components/PostCard";
import SuggestedUsers from "@/components/SuggestedUsers";
import PostTypeFilters from "@/components/PostTypeFilters";
import useRequireAuth, { requireLogin } from "@/components/useRequireAuth";

export default function Following() {
  const { me, loading } = useRequireAuth();
  const router = useRouter();
  const [posts, setPosts] = useState([]);
  const [postsLoading, setPostsLoading] = useState(true);
  const [activeType, setActiveType] = useState("");

  const load = useCallback(async (forcedType) => {
    if (!me) return;

    setPostsLoading(true);

    const pickedType =
      typeof forcedType === "string"
        ? forcedType
        : new URLSearchParams(window.location.search).get("type") || "";

    const url = pickedType
      ? `/api/posts/feed?type=${encodeURIComponent(pickedType)}`
      : "/api/posts/feed";

    const r = await fetch(url);
    if (r.ok) {
      const d = await r.json();
      setPosts(d.posts || []);
    }

    setPostsLoading(false);
  }, [me]);

  useEffect(() => {
    if (loading) return;

    if (!me) {
      requireLogin(null, router, "You need to log in to view the following feed.");
      return;
    }

    const pickedType =
      new URLSearchParams(window.location.search).get("type") || "";

    setActiveType(pickedType);
    load(pickedType);
  }, [loading, me, load, router]);

  if (loading) return null;
  if (!me) return null;

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
            FOLLOWING FEED
          </h2>

          {postsLoading && <div className="card muted">Loading...</div>}

          {!postsLoading && posts.length === 0 && (
            <div className="card muted">
              No posts from the people you follow match this filter yet.
            </div>
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
