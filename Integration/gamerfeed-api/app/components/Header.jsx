"use client";

import { useEffect, useState } from "react";
import Avatar from "./Avatar";


export default function Header({ onPostClick }) {
    const [currentUserId, setCurrentUserId] = useState(null);
    const [avatar, setAvatar] = useState("GF");

    useEffect(() => {
        const id = localStorage.getItem("currentUserId");
        setCurrentUserId(id);

        async function loadUser() {
            if (!id) return;

            const res = await fetch(`/api/users/${id}`);
            if (!res.ok) return;

            const user = await res.json();
            setAvatar(user.avatar || user.username?.slice(0, 2).toUpperCase() || "GF");
        }

        loadUser();
    }, []);

    function logout() {
        localStorage.removeItem("currentUserId");
        window.location.href = "/login";
    }

    return (
        <header>
            <div className="logo" onClick={() => (window.location.href = "/")}>
                GAMER<span>FEED</span>
            </div>

            <div className="header-spacer"></div>

            {currentUserId ? (
                <>
                    <button
                        className="btn-post"
                        onClick={() => {
                            if (onPostClick) onPostClick();
                            else window.location.href = "/";
                        }}
                    >
                        + POST
                    </button>

                    <button className="btn-post" onClick={() => (window.location.href = "/stats")}>
                        Stats
                    </button>

                    <Avatar
                        value={avatar}
                        fallback="GF"
                        className="avatar-chip"
                        alt="Current user avatar"
                    />

                    <button className="btn-logout" onClick={logout}>
                        Logout
                    </button>
                </>
            ) : (
                <>
                    <button className="btn-post" onClick={() => (window.location.href = "/login")}>
                        Login
                    </button>

                    <button className="btn-post" onClick={() => (window.location.href = "/register")}>
                        Register
                    </button>
                </>
            )}
        </header>
    );
}