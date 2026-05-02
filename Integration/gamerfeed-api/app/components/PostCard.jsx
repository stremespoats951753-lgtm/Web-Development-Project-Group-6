"use client";

import Avatar from "./Avatar";


function getAvatarClass(avatar) {
    const value = String(avatar || "").toUpperCase();

    if (value === "NK") return "gold";
    if (value === "VX") return "purple";
    if (value === "SF") return "red";

    return "green";
}

function formatDate(value) {
    const date = new Date(value);

    if (Number.isNaN(date.getTime())) return "";

    return date.toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
}

export default function PostCard({
    post,
    currentUserId,
    onOpen,
    onLike,
    onDelete,
    fullContent = false,
}) {
    const avatar = post.user?.avatar || post.user?.username?.slice(0, 2).toUpperCase() || "??";
    const username = post.user?.username || "Unknown User";
    const isOwnPost = Number(currentUserId) === Number(post.user?.id);

    return (
        <article
            className={`post-card ${post.type}`}
            onClick={() => {
                if (onOpen) onOpen(post.id);
            }}
        >
            <div className="card-body">
                <div className="card-meta">
                    <Avatar
                        value={avatar}
                        fallback={username.slice(0, 2).toUpperCase()}
                        className={`av ${getAvatarClass(avatar)}`}
                        alt={`${username} avatar`}
                    />

                    <div>
                        <div className="card-username">
                            <span
                                onClick={(e) => {
                                    e.stopPropagation();
                                    window.location.href = `/profile/${post.user?.id}`;
                                }}
                            >
                                {username}
                            </span>
                            <span className="game-tag">{post.game}</span>
                        </div>

                        <div className="card-timestamp">{formatDate(post.createdAt)}</div>
                    </div>

                    <span className="type-badge">{String(post.type || "").toUpperCase()}</span>
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

                <div className={fullContent ? "card-content profile-full-content" : "card-content"}>
                    {post.content}
                </div>
            </div>

            <div className="card-actions" onClick={(e) => e.stopPropagation()}>
                <button
                    className={`action-btn ${post.likes?.some((like) => Number(like.userId) === Number(currentUserId))
                        ? "liked"
                        : ""
                        }`}
                    onClick={() => onLike?.(post.id)}
                >
                    ♥ {post._count?.likes || 0}
                </button>

                <button className="action-btn" onClick={() => onOpen?.(post.id)}>
                    💬 {post._count?.comments || 0}
                </button>

                {isOwnPost && (
                    <button className="action-btn delete-btn" onClick={() => onDelete?.(post.id)}>
                        Delete
                    </button>
                )}

                {!fullContent && <span className="read-more">READ MORE →</span>}
            </div>
        </article>
    );
}