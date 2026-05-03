"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Header from "../../components/Header";
import PostCard from "../../components/PostCard";

function isImageUrl(value) {
    return (
        typeof value === "string" &&
        (value.startsWith("http://") || value.startsWith("https://"))
    );
}

export default function ProfilePage() {
    const params = useParams();
    const profileId = params.id;

    const [currentUserId, setCurrentUserId] = useState(null);
    const [user, setUser] = useState(null);
    const [posts, setPosts] = useState([]);
    const [followData, setFollowData] = useState(null);

    const [postFilter, setPostFilter] = useState("all");

    const [editOpen, setEditOpen] = useState(false);
    const [editUsername, setEditUsername] = useState("");
    const [editBio, setEditBio] = useState("");
    const [editAvatar, setEditAvatar] = useState("");

    const [toast, setToast] = useState("");

    useEffect(() => {
        const id = localStorage.getItem("currentUserId");

        if (!id) {
            window.location.href = "/login";
            return;
        }

        setCurrentUserId(id);
        loadProfile(profileId, id, postFilter);
    }, [profileId, postFilter]);

    async function loadProfile(id, currentId, type = "all") {
        const postsUrl =
            type === "all"
                ? `/api/posts?userId=${id}`
                : `/api/posts?userId=${id}&type=${type}`;

        const [userRes, postsRes, followRes] = await Promise.all([
            fetch(`/api/users/${id}`),
            fetch(postsUrl),
            fetch(`/api/users/${id}/follow?followerId=${currentId}`),
        ]);

        if (!userRes.ok) {
            window.location.href = "/";
            return;
        }

        const userData = await userRes.json();
        const postData = postsRes.ok ? await postsRes.json() : [];
        const followInfo = followRes.ok ? await followRes.json() : null;

        setUser(userData);
        setPosts(postData);
        setFollowData(followInfo);

        setEditUsername(userData.username || "");
        setEditBio(userData.bio || "");
        setEditAvatar(userData.avatar || "");
    }

    function showToast(message) {
        setToast(message);
        setTimeout(() => setToast(""), 2500);
    }

    const isOwnProfile = Number(currentUserId) === Number(profileId);

    async function saveProfile() {
        if (!editUsername.trim()) {
            showToast("Username cannot be empty.");
            return;
        }

        const res = await fetch(`/api/users/${profileId}`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                username: editUsername.trim(),
                bio: editBio.trim(),
                avatar: editAvatar.trim(),
            }),
        });

        if (!res.ok) {
            showToast("Failed to update profile.");
            return;
        }

        setEditOpen(false);
        await loadProfile(profileId, currentUserId, postFilter);
        showToast("Profile updated!");
    }

    async function toggleFollow() {
        const method = followData?.followedByCurrentUser ? "DELETE" : "POST";

        const res = await fetch(`/api/users/${profileId}/follow`, {
            method,
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                followerId: currentUserId,
            }),
        });

        if (!res.ok) {
            showToast("Follow action failed.");
            return;
        }

        await loadProfile(profileId, currentUserId, postFilter);

        showToast(
            method === "POST"
                ? `Following ${user.username}`
                : `Unfollowed ${user.username}`
        );
    }

    if (!user) {
        return (
            <>
                <Header />

                <div className="app-layout">
                    <main className="main-content">
                        <div className="empty-state">Loading profile...</div>
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

                        <div
                            className={`nav-item ${postFilter === "achievement" ? "active" : ""
                                }`}
                            onClick={() => setPostFilter("achievement")}
                        >
                            Achievements
                        </div>

                        <div
                            className={`nav-item ${postFilter === "discussion" ? "active" : ""
                                }`}
                            onClick={() => setPostFilter("discussion")}
                        >
                            Discussion
                        </div>

                        <div className="nav-item" onClick={() => (window.location.href = "/stats")}>
                            Stats
                        </div>

                        <div className="nav-label">YOU</div>

                        <div
                            className={`nav-item ${postFilter === "all" ? "active" : ""}`}
                            onClick={() => setPostFilter("all")}
                        >
                            My Profile
                        </div>
                    </nav>
                </aside>

                <main className="main-content">
                    <section className="profile-card">
                        <div className="profile-top">
                            <div className="profile-avatar green">
                                {isImageUrl(user.avatar) ? (
                                    <img
                                        className="avatar-img"
                                        src={user.avatar}
                                        alt={`${user.username} avatar`}
                                    />
                                ) : (
                                    user.avatar || user.username?.slice(0, 2).toUpperCase()
                                )}
                            </div>

                            <div className="profile-info">
                                <div className="profile-name-row">
                                    <h2>{user.username}</h2>
                                    <span className="profile-badge">
                                        {isOwnProfile ? "YOU" : "USER"}
                                    </span>
                                </div>

                                <div className="profile-email">{user.email}</div>

                                <p className="profile-bio">{user.bio || "No bio yet."}</p>

                                <div className="profile-stats">
                                    <div className="profile-stat">
                                        <span className="profile-stat-number">
                                            {user._count?.posts || 0}
                                        </span>
                                        <span className="profile-stat-label">Posts</span>
                                    </div>

                                    <div className="profile-stat">
                                        <span className="profile-stat-number">
                                            {user._count?.followers || 0}
                                        </span>
                                        <span className="profile-stat-label">Followers</span>
                                    </div>

                                    <div className="profile-stat">
                                        <span className="profile-stat-number">
                                            {user._count?.following || 0}
                                        </span>
                                        <span className="profile-stat-label">Following</span>
                                    </div>
                                </div>
                            </div>

                            <div className="profile-actions">
                                {isOwnProfile ? (
                                    <button className="btn-submit" onClick={() => setEditOpen(true)}>
                                        Edit Profile
                                    </button>
                                ) : (
                                    <button
                                        className={`btn-submit ${followData?.followedByCurrentUser ? "btn-unfollow" : ""
                                            }`}
                                        onClick={toggleFollow}
                                    >
                                        {followData?.followedByCurrentUser ? "Unfollow" : "Follow"}
                                    </button>
                                )}
                            </div>
                        </div>
                    </section>

                    <section className="profile-posts-section">
                        <div className="section-heading">
                            {postFilter === "all"
                                ? "POSTS"
                                : `${postFilter.toUpperCase()} POSTS`}
                        </div>

                        {posts.length === 0 ? (
                            <div className="empty-state">
                                {postFilter === "all"
                                    ? "This user has no posts yet."
                                    : `This user has no ${postFilter} posts.`}
                            </div>
                        ) : (
                            posts.map((post) => (
                                <PostCard
                                    key={post.id}
                                    post={post}
                                    currentUserId={currentUserId}
                                    fullContent
                                />
                            ))
                        )}
                    </section>
                </main>

                <aside className="sidebar-right">
                    <div className="widget">
                        <div className="widget-title">PROFILE INFO</div>

                        <div className="profile-side-info">
                            <div>
                                <strong>Username:</strong> {user.username}
                            </div>

                            <div>
                                <strong>Bio:</strong> {user.bio || "-"}
                            </div>

                            <div>
                                <strong>Avatar:</strong>{" "}
                                {isImageUrl(user.avatar) ? "Image URL" : user.avatar || "-"}
                            </div>
                        </div>
                    </div>
                </aside>
            </div>

            {editOpen && (
                <div className="modal-overlay open">
                    <div className="modal">
                        <div className="modal-top-bar"></div>

                        <div className="modal-header">
                            <div>
                                <div className="modal-heading">Edit Profile</div>
                                <div className="modal-subheading">
                                    Update your public information
                                </div>
                            </div>

                            <div className="modal-close" onClick={() => setEditOpen(false)}>
                                ✕
                            </div>
                        </div>

                        <div className="modal-body">
                            <div className="form-group">
                                <label>Username</label>
                                <input
                                    type="text"
                                    maxLength={30}
                                    value={editUsername}
                                    onChange={(e) => setEditUsername(e.target.value)}
                                />
                            </div>

                            <div className="form-group">
                                <label>Profile Image URL or Initials</label>
                                <input
                                    type="text"
                                    maxLength={300}
                                    value={editAvatar}
                                    onChange={(e) => setEditAvatar(e.target.value)}
                                    placeholder="Example: NK or https://example.com/avatar.png"
                                />
                            </div>

                            <div className="form-group">
                                <label>Bio</label>
                                <textarea
                                    rows="4"
                                    maxLength={200}
                                    value={editBio}
                                    onChange={(e) => setEditBio(e.target.value)}
                                />
                            </div>

                            <div className="modal-actions">
                                <button
                                    className="modal-action-btn"
                                    onClick={() => setEditOpen(false)}
                                >
                                    Cancel
                                </button>

                                <button className="btn-submit" onClick={saveProfile}>
                                    Save Changes
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className={`toast ${toast ? "show" : ""}`}>{toast}</div>
        </>
    );
}