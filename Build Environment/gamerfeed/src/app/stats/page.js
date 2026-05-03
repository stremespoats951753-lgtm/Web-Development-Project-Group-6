"use client";
// STATS page: 9 different stats, all computed by the database via the repo layer
// (the spec requires at least 6, we did 9 to be safe)
import { useEffect, useState } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import Avatar from "@/components/Avatar";
import useRequireAuth from "@/components/useRequireAuth";

export default function StatsPage() {
  const { me, loading } = useRequireAuth();
  const [data, setData] = useState(null);

  useEffect(() => {
    fetch("/api/stats").then((r) => r.json()).then(setData);
  }, []);

  if (loading) return null;
  if (!data) return (<><Header me={me} /><main className="app-layout"><div className="card muted">Crunching numbers...</div></main></>);

  // figure out the max bar height for the per-day chart
  const maxPerDay = Math.max(1, ...data.perDay.map((d) => d.count));

  return (
    <>
      <Header me={me} />
      <main className="app-layout" style={{ gridTemplateColumns: "1fr" }}>
        <section style={{ maxWidth: 1000, margin: "0 auto", width: "100%" }}>
          <h1 style={{ marginBottom: 14 }}>
            <span style={{ color: "var(--green)" }}>STATS</span>{" "}
            <span style={{ color: "var(--orange)" }}>DASHBOARD</span>
          </h1>
          <p className="muted" style={{ marginBottom: 18 }}>
            All numbers are computed by SQL queries inside the database
            (see <code>src/repositories/statsRepo.js</code>).
          </p>

          {/* row of basic totals (4 stats) */}
          <div className="stats-grid">
            <div className="stat-tile">
              <div className="num">{data.totals.users}</div>
              <div className="label">Total users</div>
            </div>
            <div className="stat-tile">
              <div className="num">{data.totals.posts}</div>
              <div className="label">Total posts</div>
            </div>
            <div className="stat-tile">
              <div className="num">{data.totals.comments}</div>
              <div className="label">Total comments</div>
            </div>
            <div className="stat-tile">
              <div className="num">{data.totals.likes}</div>
              <div className="label">Total likes</div>
            </div>
            <div className="stat-tile">
              <div className="num">{data.avgFollowers}</div>
              <div className="label">Avg followers / user</div>
            </div>
            <div className="stat-tile">
              <div className="num">{data.avgPosts}</div>
              <div className="label">Avg posts / user</div>
            </div>
          </div>

          {/* most active user (last 3 months) */}
          <div className="card">
            <div className="widget-title">Most active user (last 3 months)</div>
            {data.mostActive ? (
              <div className="hstack">
                <Link href={`/profile/${data.mostActive.user.id}`}>
                  <Avatar user={data.mostActive.user} />
                </Link>
                <div>
                  <div><b>@{data.mostActive.user.username}</b></div>
                  <div className="muted" style={{ fontSize: 13 }}>
                    {data.mostActive.postCount} posts in the last 90 days
                  </div>
                </div>
              </div>
            ) : <div className="muted">No data</div>}
          </div>

          {/* most used word */}
          <div className="card">
            <div className="widget-title">Most used word in posts</div>
            {data.mostUsedWord ? (
              <div>
                <span className="num" style={{ fontSize: 26 }}>{data.mostUsedWord.word}</span>{" "}
                <span className="muted">used {data.mostUsedWord.count} times</span>
              </div>
            ) : <div className="muted">No data</div>}
          </div>

          {/* post type distribution */}
          <div className="card">
            <div className="widget-title">Post type distribution</div>
            <div className="hstack" style={{ flexWrap: "wrap", gap: 18 }}>
              {data.typeDist.map((t) => (
                <div key={t.type}>
                  <span className={"badge " + t.type}>{t.type}</span>{" "}
                  <b>{t.count}</b>
                </div>
              ))}
            </div>
          </div>

          {/* posts per day last 7 days, tiny custom bar chart */}
          <div className="card">
            <div className="widget-title">Posts per day (last 7 days)</div>
            <div className="bar-chart">
              {data.perDay.length === 0 && <div className="muted">No posts in the last week.</div>}
              {data.perDay.map((d) => (
                <div key={d.day} style={{ flex: 1 }}>
                  <div className="bar" style={{ height: `${(d.count / maxPerDay) * 100}%` }} />
                  <div className="bar-label">{d.day.slice(5)}</div>
                  <div className="bar-label" style={{ color: "var(--green)" }}>{d.count}</div>
                </div>
              ))}
            </div>
          </div>

          {/* top liked posts */}
          <div className="card">
            <div className="widget-title">Top 5 most liked posts</div>
            {data.topLiked.length === 0 && <div className="muted">No likes yet.</div>}
            {data.topLiked.map((p) => (
              <div key={p.id} className="user-row">
                <Avatar user={p.author} />
                <div className="meta">
                  <div className="u">@{p.author.username}</div>
                  <div className="b">{p.content.slice(0, 80)}</div>
                </div>
                <span className="num" style={{ fontSize: 18 }}>{p.likeCount} ♥</span>
              </div>
            ))}
          </div>

          {/* top followed users */}
          <div className="card">
            <div className="widget-title">Top 5 most followed users</div>
            {data.topFollowed.length === 0 && <div className="muted">No follows yet.</div>}
            {data.topFollowed.map((u) => (
              <div key={u.id} className="user-row">
                <Link href={`/profile/${u.id}`}><Avatar user={u} /></Link>
                <div className="meta">
                  <div className="u"><Link href={`/profile/${u.id}`}>@{u.username}</Link></div>
                </div>
                <span className="num" style={{ fontSize: 18 }}>{u.followers}</span>
              </div>
            ))}
          </div>

        </section>
      </main>
    </>
  );
}
