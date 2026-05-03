"use client";

import { useState } from "react";

export default function RegisterPage() {
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const [usernameError, setUsernameError] = useState("");
    const [emailError, setEmailError] = useState("");
    const [passwordError, setPasswordError] = useState("");
    const [confirmError, setConfirmError] = useState("");
    const [message, setMessage] = useState("");

    function validateEmail(value) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
    }

    async function handleRegister(e) {
        e.preventDefault();

        setUsernameError("");
        setEmailError("");
        setPasswordError("");
        setConfirmError("");
        setMessage("");

        let valid = true;

        if (username.trim().length < 3) {
            setUsernameError("Username must be at least 3 characters.");
            valid = false;
        }

        if (!validateEmail(email)) {
            setEmailError("Please enter a valid email address.");
            valid = false;
        }

        if (password.length < 6) {
            setPasswordError("Password must be at least 6 characters.");
            valid = false;
        }

        if (confirmPassword !== password) {
            setConfirmError("Passwords do not match.");
            valid = false;
        }

        if (!valid) return;

        const res = await fetch("/api/auth/register", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                username: username.trim(),
                email: email.trim().toLowerCase(),
                password,
            }),
        });

        const data = await res.json();

        if (!res.ok) {
            setMessage(data.error || "Registration failed.");
            return;
        }

        setMessage("Account created successfully. Redirecting to login...");

        setTimeout(() => {
            window.location.href = "/login";
        }, 800);
    }

    return (
        <main className="auth-page">
            <section className="auth-shell">
                <div className="auth-brand-panel">
                    <div className="brand-logo">
                        <span className="brand-green">GAMER</span>
                        <span className="brand-orange">FEED</span>
                    </div>

                    <p className="brand-tagline">
                        Create your account and join the gaming community. Share achievements,
                        updates, and discussions with other players.
                    </p>

                    <div className="brand-cards">
                        <div className="mini-card">
                            <span className="mini-label">Create</span>
                            <h3>Build your gamer profile</h3>
                            <p>Choose your username, set up your account, and get ready to post.</p>
                        </div>

                        <div className="mini-card">
                            <span className="mini-label">Connect</span>
                            <h3>Join the feed</h3>
                            <p>Follow players, comment on posts, and stay updated with your favorite games.</p>
                        </div>
                    </div>
                </div>

                <section className="auth-form-panel">
                    <form className="auth-form" onSubmit={handleRegister} noValidate>
                        <h2>Create Account</h2>
                        <p className="form-subtitle">Enter your details to register for GamerFeed.</p>

                        <div className="input-group">
                            <label htmlFor="registerUsername">Username</label>
                            <input
                                type="text"
                                id="registerUsername"
                                placeholder="Choose a username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                            />
                            <small className="error-text">{usernameError}</small>
                        </div>

                        <div className="input-group">
                            <label htmlFor="registerEmail">Email</label>
                            <input
                                type="email"
                                id="registerEmail"
                                placeholder="Enter your email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                            <small className="error-text">{emailError}</small>
                        </div>

                        <div className="input-group">
                            <label htmlFor="registerPassword">Password</label>
                            <input
                                type="password"
                                id="registerPassword"
                                placeholder="Create a password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                            <small className="error-text">{passwordError}</small>
                        </div>

                        <div className="input-group">
                            <label htmlFor="registerConfirmPassword">Confirm Password</label>
                            <input
                                type="password"
                                id="registerConfirmPassword"
                                placeholder="Confirm your password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                            />
                            <small className="error-text">{confirmError}</small>
                        </div>

                        <small className="global-message">{message}</small>

                        <button type="submit" className="submit-btn">
                            REGISTER
                        </button>

                        <p className="bottom-link">
                            Already have an account? <a href="/login">Log In</a>
                        </p>
                    </form>
                </section>
            </section>
        </main>
    );
}