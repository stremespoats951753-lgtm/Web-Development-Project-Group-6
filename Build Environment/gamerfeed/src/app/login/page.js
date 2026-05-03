"use client";
// login page. animated synthwave grid in the background (only here + register)
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const router = useRouter();

  async function submit(e) {
    e.preventDefault();
    setError(""); setBusy(true);
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    setBusy(false);
    if (!res.ok) {
      const d = await res.json().catch(() => ({}));
      setError(d.error || "Login failed");
      return;
    }
    router.push("/feed");
    router.refresh();
  }

  return (
    <div className="auth-page">
      <form className="auth-shell" onSubmit={submit}>
        <h1>
          <span style={{ color: "var(--green)" }}>GAMER</span>
          <span style={{ color: "var(--orange)" }}>FEED</span>
        </h1>
        <p className="sub">Welcome back, log in to keep the streak going</p>

        <div className="field">
          <label className="label">Username</label>
          <input
            className="input"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoComplete="username"
            required
          />
        </div>
        <div className="field">
          <label className="label">Password</label>
          <input
            className="input"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            required
          />
        </div>
        {error && <div className="error-msg">{error}</div>}
        <button className="btn" style={{ width: "100%" }} disabled={busy}>
          {busy ? "Logging in..." : "Log in"}
        </button>
        <div className="auth-switch">
          New here? <Link href="/register">Create an account</Link>
        </div>
        <div className="auth-switch" style={{ marginTop: 4 }}>
          Demo: <b>demo</b> / <b>password123</b>
        </div>
      </form>
    </div>
  );
}
