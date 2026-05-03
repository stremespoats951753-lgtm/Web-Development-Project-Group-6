"use client";

import { useEffect, useState } from "react";
import Header from "./components/Header";
import PostCard from "./components/PostCard";
import Avatar from "./components/Avatar";

export default function FeedPage() {
    const [currentUserId, setCurrentUserId] = useState(null);
    const [currentUser, setCurrentUser] = useState(null);
    const [ready, setReady] = useState(false);

    const [posts, setPosts] = useState([]);
    const [filter, setFilter] = useState("all");

    const [selectedType, setSelectedType] = useState("update");
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");

    const [modalPost, setModalPost] = useState(null);
    const [commentText, setCommentText] = useState("");
    const [toast, setToast] = useState("");

    const [users, setUsers] = useState([]);

    useEffect(() => {
        const id = localStorage.getItem("currentUserId");

        if (!id) {
            window.location.href = "/login";
            return;
        }

        setCurrentUserId(id);
        setReady(true);

        loadUser(id);
        loadPosts(filter);
        loadUsers(id);
    }, [filter]);

    async function loadUsers(currentId) {
        try {
            const res = await fetch("/api/users");

            if (!res.ok) return;

            const data = await res.json();

            setUsers(data.filter((user) => Number(user.id) !== Number(currentId)));
        } catch (error) {
            console.error("Failed to load users:", error);
            setUsers([]);
        }
    }

    async function loadUser(id) {
        try {
            const res = await fetch(`/api/users/${id}`);

            if (!res.ok) {
                localStorage.removeItem("currentUserId");
                window.location.href = "/login";
                return;
            }

            const user = await res.json();
            setCurrentUser(user);
        } catch (error) {
            console.error("Failed to load user:", error);
        }
    }

    async function loadPosts(type = "all") {
        try {
            const id = localStorage.getItem("currentUserId");

            if (!id) {
                window.location.href = "/login";
                return;
            }

            const url =
                type === "all"
                    ? `/api/posts?feedUserId=${id}`
                    : `/api/posts?feedUserId=${id}&type=${type}`;

            const res = await fetch(url);

            if (!res.ok) {
                setPosts([]);
                return;
            }

            const data = await res.json();
            setPosts(data);
        } catch (error) {
            console.error("Failed to load posts:", error);
            setPosts([]);
        }
    }

    function showToast(message) {
        setToast(message);
        setTimeout(() => setToast(""), 2500);
    }

    function scrollToCreate() {
        document.getElementById("create-post-box")?.scrollIntoView({
            behavior: "smooth",
            block: "center",
        });
    }

    async function submitPost() {
        if (!currentUserId) {
            window.location.href = "/login";
            return;
        }

        if (!title.trim() || !content.trim()) {
            showToast("Please fill in both title and content.");
            return;
        }

        const res = await fetch("/api/posts", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                userId: currentUserId,
                type: selectedType,
                game: "Your Game",
                title: title.trim(),
                content: content.trim(),
            }),
        });

        if (!res.ok) {
            showToast("Failed to create post.");
            return;
        }

        setTitle("");
        setContent("");
        setSelectedType("update");

        await loadPosts(filter);
        showToast("Post published!");
    }

    async function deletePost(postId) {
        const res = await fetch(`/api/posts/${postId}`, {
            method: "DELETE",
        });

        if (!res.ok) {
            showToast("Failed to delete post.");
            return;
        }

        await loadPosts(filter);
        closeModal();
        showToast("Post deleted!");
    }

    async function toggleLike(postId) {
        if (!currentUserId) {
            window.location.href = "/login";
            return;
        }

        const res = await fetch(`/api/posts/${postId}/like`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ userId: currentUserId }),
        });

        if (!res.ok) {
            showToast("Failed to update like.");
            return;
        }

        await loadPosts(filter);

        if (modalPost?.id === postId) {
            await openModal(postId);
        }
    }

    async function deleteComment(commentId) {
        const res = await fetch(`/api/comments/${commentId}`, {
            method: "DELETE",
        });

        if (!res.ok) {
            showToast("Failed to delete comment.");
            return;
        }

        if (modalPost) {
            await openModal(modalPost.id);
            await loadPosts(filter);
        }

        showToast("Comment deleted.");
    }

    async function openModal(postId) {
        const res = await fetch(`/api/posts/${postId}`);

        if (!res.ok) {
            showToast("Failed to open post.");
            return;
        }

        const post = await res.json();
        setModalPost(post);
    }

    function closeModal() {
        setModalPost(null);
        setCommentText("");
    }

    async function submitComment() {
        if (!currentUserId) {
            window.location.href = "/login";
            return;
        }

        if (!modalPost || !commentText.trim()) return;

        const res = await fetch(`/api/posts/${modalPost.id}/comments`, {
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

        await openModal(modalPost.id);
        await loadPosts(filter);

        showToast("Comment posted!");
    }

    function typeChipClass(type) {
        return `type-chip ${type} ${selectedType === type ? "selected" : ""}`;
    }

    if (!ready) {
        return null;
    }

    return (
        <>
            <Header onPostClick={scrollToCreate} />

            <div className="app-layout">
                <aside className="sidebar-left">
                    <nav>
                        <div className="nav-label">MAIN</div>

                        <div
                            className={`nav-item ${filter === "all" ? "active" : ""}`}
                            onClick={() => setFilter("all")}
                        >
                            Feed
                        </div>

                        <div
                            className={`nav-item ${filter === "achievement" ? "active" : ""}`}
                            onClick={() => setFilter("achievement")}
                        >
                            Achievements
                        </div>

                        <div
                            className={`nav-item ${filter === "discussion" ? "active" : ""}`}
                            onClick={() => setFilter("discussion")}
                        >
                            Discussion
                        </div>

                        <div className="nav-item" onClick={() => (window.location.href = "/stats")}>
                            Stats
                        </div>

                        <div className="nav-label">YOU</div>

                        <div
                            className="nav-item"
                            onClick={() => {
                                if (currentUserId) {
                                    window.location.href = `/profile/${currentUserId}`;
                                }
                            }}
                        >
                            My Profile
                        </div>
                    </nav>
                </aside>

                <main className="main-content">
                    <section className="create-post" id="create-post-box">
                        <div className="create-post-row">
                            <Avatar
                                value={currentUser?.avatar}
                                fallback={currentUser?.username?.slice(0, 2).toUpperCase() || "GF"}
                                className="post-avatar"
                                alt={`${currentUser?.username || "User"} avatar`}
                            />

                            <div className="create-post-inputs">
                                <input
                                    type="text"
                                    placeholder="Post title..."
                                    maxLength={100}
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                />

                                <div className="type-chips">
                                    <button
                                        type="button"
                                        className={typeChipClass("update")}
                                        onClick={() => setSelectedType("update")}
                                    >
                                        UPDATE
                                    </button>

                                    <button
                                        type="button"
                                        className={typeChipClass("achievement")}
                                        onClick={() => setSelectedType("achievement")}
                                    >
                                        ACHIEVEMENT
                                    </button>

                                    <button
                                        type="button"
                                        className={typeChipClass("discussion")}
                                        onClick={() => setSelectedType("discussion")}
                                    >
                                        DISCUSSION
                                    </button>
                                </div>

                                <textarea
                                    rows="3"
                                    placeholder="What's happening in your game world?"
                                    value={content}
                                    onChange={(e) => setContent(e.target.value)}
                                />

                                <div className="post-footer">
                                    <button
                                        type="button"
                                        className="btn-cancel"
                                        onClick={() => {
                                            setTitle("");
                                            setContent("");
                                            setSelectedType("update");
                                        }}
                                    >
                                        CLEAR
                                    </button>

                                    <button type="button" className="btn-submit" onClick={submitPost}>
                                        POST IT
                                    </button>
                                </div>
                            </div>
                        </div>
                    </section>

                    <div className="feed-filters">
                        {["all", "update", "achievement", "discussion"].map((item) => (
                            <button
                                key={item}
                                className={`feed-filter ${filter === item ? "active" : ""}`}
                                onClick={() => setFilter(item)}
                            >
                                {item === "all" ? "ALL" : `${item.toUpperCase()}S`}
                            </button>
                        ))}
                    </div>

                    <div id="feed-container">
                        {posts.length === 0 ? (
                            <div className="empty-state">No posts found.</div>
                        ) : (
                            posts.map((post) => (
                                <PostCard
                                    key={post.id}
                                    post={post}
                                    currentUserId={currentUserId}
                                    onOpen={openModal}
                                    onLike={toggleLike}
                                    onDelete={deletePost}
                                />
                            ))
                        )}
                    </div>
                </main>

                <aside className="sidebar-right">
                    <div className="widget">
                        <div className="widget-title">DISCOVER USERS</div>

                        {users.length === 0 ? (
                            <div style={{ color: "#666", fontSize: 13 }}>
                                No other users found.
                            </div>
                        ) : (
                            users.slice(0, 5).map((user) => (
                                <div className="leader-item" key={user.id}>
                                    <Avatar
                                        value={user.avatar}
                                        fallback={user.username?.slice(0, 2).toUpperCase() || "??"}
                                        className="av green"
                                        alt={`${user.username} avatar`}
                                    />

                                    <span className="leader-name">{user.username}</span>

                                    <button
                                        className="mini-follow-btn"
                                        onClick={() => (window.location.href = `/profile/${user.id}`)}
                                    >
                                        View
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                </aside>
            </div>

            {modalPost && (
                <div
                    className="modal-overlay open"
                    onClick={(e) => {
                        if (e.target.classList.contains("modal-overlay")) closeModal();
                    }}
                >
                    <article className="modal">
                        <div className="modal-top-bar"></div>

                        <div className="modal-header">
                            <Avatar
                                value={modalPost.user?.avatar}
                                fallback={modalPost.user?.username?.slice(0, 2).toUpperCase() || "??"}
                                className="av green modal-avatar"
                                alt={`${modalPost.user?.username} avatar`}
                            />

                            <div>
                                <div style={{ fontSize: 14, fontWeight: "bold" }}>
                                    {modalPost.user?.username} · {modalPost.game}
                                </div>
                                <div style={{ fontSize: 11, color: "#555" }}>
                                    {new Date(modalPost.createdAt).toLocaleString()}
                                </div>
                            </div>

                            <div className="modal-close" onClick={closeModal}>
                                ✕
                            </div>
                        </div>

                        <div className="modal-body">
                            <div className="modal-title">{modalPost.title}</div>
                            <div className="modal-text">{modalPost.content}</div>

                            <div className="modal-actions">
                                <button
                                    className={`modal-action-btn ${modalPost.likes?.some((like) => Number(like.userId) === Number(currentUserId))
                                        ? "liked"
                                        : ""
                                        }`}
                                    onClick={() => toggleLike(modalPost.id)}
                                >
                                    {modalPost._count?.likes || modalPost.likes?.length || 0} Likes
                                </button>

                                <button className="modal-action-btn">Comment</button>
                                <button className="modal-action-btn">Share</button>

                                <a className="modal-action-btn" href={`/posts/${modalPost.id}`}>
                                    Open Page
                                </a>
                            </div>
                        </div>

                        <div className="comments-section">
                            <div className="comments-header">
                                COMMENTS ({modalPost.comments?.length || 0})
                            </div>

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

                            <div>
                                {modalPost.comments?.length ? (
                                    modalPost.comments.map((comment) => (
                                        <div className="comment-item" key={comment.id}>
                                            <Avatar
                                                value={comment.user?.avatar}
                                                fallback={comment.user?.username?.slice(0, 2).toUpperCase() || "??"}
                                                className="av green"
                                                alt={`${comment.user?.username} avatar`}
                                            />

                                            <div className="comment-bubble">
                                                <div className="comment-top">
                                                    <span className="comment-user">
                                                        {comment.user?.username}
                                                    </span>

                                                    <span className="comment-time">
                                                        {new Date(comment.createdAt).toLocaleTimeString([], {
                                                            hour: "2-digit",
                                                            minute: "2-digit",
                                                        })}
                                                    </span>
                                                </div>

                                                <div className="comment-text">{comment.text}</div>

                                                {Number(currentUserId) === Number(comment.user?.id) && (
                                                    <button
                                                        className="comment-delete-btn"
                                                        onClick={() => deleteComment(comment.id)}
                                                    >
                                                        Delete
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div style={{ color: "#666", fontSize: 13 }}>
                                        No comments yet.
                                    </div>
                                )}
                            </div>
                        </div>
                    </article>
                </div>
            )}

            <div className={`toast ${toast ? "show" : ""}`}>{toast}</div>
        </>
    );
}