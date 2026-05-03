"use client";

import { useEffect, useState } from "react";
import Header from "../components/Header";

export default function StatsPage() {
    const [stats, setStats] = useState(null);

    useEffect(() => {
        const id = localStorage.getItem("currentUserId");

        if (!id) {
            window.location.href = "/login";
            return;
        }

        loadStats();
    }, []);

    async function loadStats() {
        const res = await fetch("/api/stats");
        if (!res.ok) return;

        const data = await res.json();
        setStats(data);
    }

    if (!stats) {
        return (
            <>
                <Header />

                <div className="app-layout">
                    <main className="main-content">
                        <div className="empty-state">Loading statistics...</div>
                    </main>
                </div>
            </>
        );
    }

    return (
        <>
            <Header />

            <div className="app-layout">
                <aside className="sidebar-left">
                    <nav>
                        <div className="nav-label">MAIN</div>

                        <div className="nav-item" onClick={() => (window.location.href = "/")}>
                            Feed
                        </div>

                        <div className="nav-item active">Stats</div>

                        <div className="nav-label">YOU</div>

                        <div
                            className="nav-item"
                            onClick={() =>
                            (window.location.href = `/profile/${localStorage.getItem(
                                "currentUserId"
                            )}`)
                            }
                        >
                            My Profile
                        </div>
                    </nav>
                </aside>

                <main className="main-content">
                    <section className="profile-card">
                        <div className="profile-name-row">
                            <h2>Platform Statistics</h2>
                        </div>

                    </section>

                    <section className="stats-grid">
                        <div className="stat-card">
                            <span>{stats.totalUsers}</span>
                            <p>Total Users</p>
                        </div>

                        <div className="stat-card">
                            <span>{stats.totalPosts}</span>
                            <p>Total Posts</p>
                        </div>

                        <div className="stat-card">
                            <span>{stats.totalComments}</span>
                            <p>Total Comments</p>
                        </div>

                        <div className="stat-card">
                            <span>{stats.totalLikes}</span>
                            <p>Total Likes</p>
                        </div>

                        <div className="stat-card">
                            <span>{stats.totalFollows}</span>
                            <p>Total Follows</p>
                        </div>

                        <div className="stat-card">
                            <span>{stats.averageLikesPerPost}</span>
                            <p>Avg Likes / Post</p>
                        </div>

                        <div className="stat-card">
                            <span>{stats.averageCommentsPerPost}</span>
                            <p>Avg Comments / Post</p>
                        </div>

                        <div className="stat-card">
                            <span>{stats.averageFollowersPerUser}</span>
                            <p>Avg Followers / User</p>
                        </div>
                    </section>

                    <section className="widget">
                        <div className="widget-title">POSTS BY TYPE</div>

                        {Object.entries(stats.postsByType || {}).map(([type, count]) => (
                            <div className="stat-row" key={type}>
                                <span>{type}</span>
                                <strong>{count}</strong>
                            </div>
                        ))}
                    </section>

                    <section className="widget">
                        <div className="widget-title">MOST LIKED POSTS</div>

                        {stats.mostLikedPosts?.map((post) => (
                            <div className="stat-row" key={post.id}>
                                <span>
                                    {post.title} — {post.user?.username}
                                </span>
                                <strong>{post._count.likes} likes</strong>
                            </div>
                        ))}
                    </section>

                    <section className="widget">
                        <div className="widget-title">MOST COMMENTED POSTS</div>

                        {stats.mostCommentedPosts?.map((post) => (
                            <div className="stat-row" key={post.id}>
                                <span>
                                    {post.title} — {post.user?.username}
                                </span>
                                <strong>{post._count.comments} comments</strong>
                            </div>
                        ))}
                    </section>

                    <section className="widget">
                        <div className="widget-title">MOST ACTIVE USERS</div>

                        {stats.mostActiveUsers?.map((user) => (
                            <div className="stat-row" key={user.id}>
                                <span>{user.username}</span>
                                <strong>{user._count.posts} posts</strong>
                            </div>
                        ))}
                    </section>
                </main>
            </div>
        </>
    );
}