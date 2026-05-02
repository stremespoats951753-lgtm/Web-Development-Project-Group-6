"use client";

import { useEffect, useState } from "react";

export default function Navbar() {
    const [currentUserId, setCurrentUserId] = useState(null);

    useEffect(() => {
        setCurrentUserId(localStorage.getItem("currentUserId"));
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

            <input
                type="text"
                placeholder="Search GamerFeed..."
                aria-label="Search"
            />

            {currentUserId ? (
                <>
                    <button className="btn-post" onClick={() => (window.location.href = "/")}>
                        Feed
                    </button>

                    <button
                        className="btn-post"
                        onClick={() => (window.location.href = `/profile/${currentUserId}`)}
                    >
                        Profile
                    </button>

                    <button className="btn-post" onClick={() => (window.location.href = "/stats")}>
                        Stats
                    </button>

                    <div className="avatar-chip">GF</div>

                    <button className="btn-logout" onClick={logout}>
                        Logout
                    </button>
                </>
            ) : (
                <>
                    <button className="btn-post" onClick={() => (window.location.href = "/login")}>
                        Login
                    </button>

                    <button className="btn-logout" onClick={() => (window.location.href = "/register")}>
                        Register
                    </button>
                </>
            )}
        </header>
    );
}