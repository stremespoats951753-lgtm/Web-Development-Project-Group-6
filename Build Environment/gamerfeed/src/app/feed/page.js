"use client";
// FEED page = the main news feed (posts from people I follow + me)
// Important: this is NOT "all posts", it only shows the FOLLOWING feed
// (fixes the "when I hit following it shows all tweets" bug from feedback)
import { useEffect, useState, useCallback } from "react";
import Header from "@/components/Header";
import Composer from "@/components/Composer";
import PostCard from "@/components/PostCard";
import SuggestedUsers from "@/components/SuggestedUsers";
import useRequireAuth from "@/components/useRequireAuth";

export default function FeedPage() {
  const { me, loading } = useRequireAuth();
  const [posts, setPosts] = useState([]);
  const [postsLoading, setPostsLoading] = useState(true);

  const load = useCallback(async () => {
    setPostsLoading(true);
    const r = await fetch(me ? "/api/posts/feed" : "/api/posts");
    if (r.ok) {
      const d = await r.json();
      setPosts(d.posts || []);
    }
    setPostsLoading(false);
  }, [me]);

  useEffect(() => { if (!loading) load(); }, [loading, me, load]);

  if (loading) return null;

  function removePost(id) { setPosts((p) => p.filter((x) => x.id !== id)); }

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
          <Composer onPosted={load} me={me} />
          <h2 style={{ margin: "16px 0 10px", fontSize: 14, letterSpacing: 2, color: "var(--green)" }}>
            {me ? "FOLLOWING FEED" : "RECENT POSTS"}
          </h2>
          {postsLoading && <div className="card muted">Loading...</div>}
          {!postsLoading && posts.length === 0 && (
            <div className="card muted">
              No posts yet. Try following a few people from the Explore page.
            </div>
          )}
          {posts.map((p) => (
            <PostCard key={p.id} post={p} currentUserId={me?.id} me={me} onDeleted={removePost} />
          ))}
        </section>

        <aside className="sidebar-right">
          <SuggestedUsers me={me} />
        </aside>
      </main>
    </>
  );
}
