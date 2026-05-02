"use client";

import { useState } from "react";

export default function LoginPage() {
    const [email, setEmail] = useState("nightkira@gamerfeed.demo");
    const [password, setPassword] = useState("123456");
    const [emailError, setEmailError] = useState("");
    const [passwordError, setPasswordError] = useState("");
    const [loginMessage, setLoginMessage] = useState("");

    async function handleLogin(e) {
        e.preventDefault();

        setEmailError("");
        setPasswordError("");
        setLoginMessage("");

        let valid = true;

        if (!email.includes("@")) {
            setEmailError("Invalid email");
            valid = false;
        }

        if (!password) {
            setPasswordError("Enter password");
            valid = false;
        }

        if (!valid) return;

        const res = await fetch("/api/auth/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                email: email.trim().toLowerCase(),
                password,
            }),
        });

        const data = await res.json();

        if (!res.ok) {
            setLoginMessage(data.error || "Invalid credentials");
            return;
        }

        localStorage.setItem("currentUserId", data.user.id);
        window.location.href = "/";
    }

    return (
        <main className="auth-page">
            <section className="auth-shell">
                <div className="brand-panel">
                    <h1 className="logo">
                        <span className="green">GAMER</span>
                        <span className="orange">FEED</span>
                    </h1>

                    <p className="tagline">Share achievements. Discover players. Stay in the game.</p>

                    <div className="feature-box">
                        <p>🎮 Track achievements</p>
                        <p>🔥 Follow top players</p>
                        <p>💬 Join discussions</p>
                    </div>
                </div>

                <div className="form-panel">
                    <form onSubmit={handleLogin} noValidate>
                        <h2>Welcome Back</h2>
                        <p className="subtitle">Log in to continue</p>

                        <div className="input-group">
                            <label htmlFor="email">Email</label>
                            <input
                                type="email"
                                id="email"
                                placeholder="Enter email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                            <small>{emailError}</small>
                        </div>

                        <div className="input-group">
                            <label htmlFor="password">Password</label>
                            <input
                                type="password"
                                id="password"
                                placeholder="Enter password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                            <small>{passwordError}</small>
                        </div>

                        <small>{loginMessage}</small>

                        <button type="submit" className="btn-primary">
                            LOGIN
                        </button>

                        <a href="/register" className="btn-secondary">
                            CREATE ACCOUNT
                        </a>
                    </form>
                </div>
            </section>
        </main>
    );
}