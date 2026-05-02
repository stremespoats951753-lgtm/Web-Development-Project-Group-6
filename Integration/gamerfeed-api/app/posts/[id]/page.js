"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Header from "../../components/Header";

export default function SinglePostPage() {
    const params = useParams();
    const postId = params.id;

    const [currentUserId, setCurrentUserId] = useState(null);
    const [post, setPost] = useState(null);
    const [commentText, setCommentText] = useState("");
    const [toast, setToast] = useState("");

    useEffect(() => {
        const id = localStorage.getItem("currentUserId");

        if (!id) {
            window.location.href = "/login";
            return;
        }

        setCurrentUserId(id);
        loadPost();
    }, [postId]);

    async function loadPost() {
        const res = await fetch(`/api/posts/${postId}`);

        if (!res.ok) {
            window.location.href = "/";
            return;
        }

        const data = await res.json();
        setPost(data);
    }

    function showToast(message) {
        setToast(message);
        setTimeout(() => setToast(""), 2500);
    }

    async function toggleLike() {
        const res = await fetch(`/api/posts/${postId}/like`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ userId: currentUserId }),
        });

        if (!res.ok) {
            showToast("Failed to like post.");
            return;
        }

        await loadPost();
    }

    async function submitComment() {
        if (!commentText.trim()) return;

        const res = await fetch(`/api/posts/${postId}/comments`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                userId: currentUserId,
                text: commentText.trim(),
            }),
        });

        if (!res.ok) {
            showToast("Failed to post comment.");
            return;
        }

        setCommentText("");
        await loadPost();
        showToast("Comment posted!");
    }

    async function deletePost() {
        const res = await fetch(`/api/posts/${postId}`, {
            method: "DELETE",
        });

        if (!res.ok) {
            showToast("Failed to delete post.");
            return;
        }

        window.location.href = "/";
    }

    if (!post) {
        return (
            <>
                <Header />

                <div className="app-layout">
                    <main className="main-content">
                        <div className="empty-state">Loading post...</div>
                    </main>
                </div>
            </>
        );
    }

    const isOwnPost = Number(currentUserId) === Number(post.user?.id);

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

                        <div className="nav-item active">Post Detail</div>

                        <div className="nav-label">AUTHOR</div>

                        <div
                            className="nav-item"
                            onClick={() => (window.location.href = `/profile/${post.user?.id}`)}
                        >
                            View Profile
                        </div>

                        <div className="nav-item" onClick={() => (window.location.href = "/stats")}>
                            Stats
                        </div>
                    </nav>
                </aside>

                <main className="main-content">
                    <article className={`post-card ${post.type}`}>
                        <div className="card-body">
                            <div className="card-meta">
                                <div className="av green">{post.user?.avatar}</div>

                                <div>
                                    <div className="card-username">
                                        <span onClick={() => (window.location.href = `/profile/${post.user?.id}`)}>
                                            {post.user?.username}
                                        </span>
                                        <span className="game-tag">{post.game}</span>
                                    </div>

                                    <div className="card-timestamp">
                                        {new Date(post.createdAt).toLocaleString()}
                                    </div>
                                </div>

                                <span className="type-badge">{post.type?.toUpperCase()}</span>
                            </div>

                            <div className="card-title">{post.title}</div>

                            {post.hasAchievement && (
                                <div className="achievement-banner">
                                    <div>
                                        <div className="achievement-label">ACHIEVEMENT UNLOCKED</div>
                                        <div className="achievement-name">{post.achievementName || post.title}</div>
                                    </div>
                                </div>
                            )}

                            <div className="card-content profile-full-content">{post.content}</div>
                        </div>

                        <div className="card-actions">
                            <button className="action-btn" onClick={toggleLike}>
                                ♥ {post._count?.likes || post.likes?.length || 0}
                            </button>

                            <button className="action-btn">💬 {post.comments?.length || 0}</button>

                            {isOwnPost && (
                                <button className="action-btn delete-btn" onClick={deletePost}>
                                    Delete
                                </button>
                            )}
                        </div>
                    </article>

                    <section className="widget">
                        <div className="widget-title">COMMENTS ({post.comments?.length || 0})</div>

                        <div className="comment-input-row">
                            <textarea
                                rows="2"
                                placeholder="Join the discussion..."
                                value={commentText}
                                onChange={(e) => setCommentText(e.target.value)}
                            />

                            <button className="btn-comment" onClick={submitComment}>
                                POST
                            </button>
                        </div>

                        {post.comments?.length ? (
                            post.comments.map((comment) => (
                                <div className="comment-item" key={comment.id}>
                                    <div className="av green">{comment.user?.avatar}</div>

                                    <div className="comment-bubble">
                                        <div className="comment-top">
                                            <span className="comment-user">{comment.user?.username}</span>
                                            <span className="comment-time">
                                                {new Date(comment.createdAt).toLocaleTimeString([], {
                                                    hour: "2-digit",
                                                    minute: "2-digit",
                                                })}
                                            </span>
                                        </div>

                                        <div className="comment-text">{comment.text}</div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div style={{ color: "#666", fontSize: 13 }}>No comments yet.</div>
                        )}
                    </section>
                </main>

                <aside className="sidebar-right">
                    <div className="widget">
                        <div className="widget-title">POST INFO</div>
                        <div className="profile-side-info">
                            <div>
                                <strong>Author:</strong> {post.user?.username}
                            </div>
                            <div>
                                <strong>Game:</strong> {post.game}
                            </div>
                            <div>
                                <strong>Type:</strong> {post.type}
                            </div>
                        </div>
                    </div>
                </aside>
            </div>

            <div className={`toast ${toast ? "show" : ""}`}>{toast}</div>
        </>
    );
}