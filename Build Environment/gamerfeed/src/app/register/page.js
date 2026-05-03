"use client";
// register page, basic validation done in the api but we also do simple client checks
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
  const [form, setForm] = useState({ username: "", email: "", password: "", bio: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const router = useRouter();

  function update(k, v) { setForm({ ...form, [k]: v }); }

  async function submit(e) {
    e.preventDefault();
    setError("");
    // tiny client side checks, server checks again to be safe
    if (form.password.length < 6) { setError("Password must be at least 6 chars"); return; }
    if (!form.email.includes("@")) { setError("Email looks invalid"); return; }
    setBusy(true);
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setBusy(false);
    if (!res.ok) {
      const d = await res.json().catch(() => ({}));
      setError(d.error || "Could not register"); return;
    }
    router.push("/feed");
    router.refresh();
  }

  return (
    <div className="auth-page">
      <form className="auth-shell" onSubmit={submit}>
        <h1>
          <span style={{ color: "var(--green)" }}>JOIN </span>
          <span style={{ color: "var(--pink)" }}>THE GAME</span>
        </h1>
        <p className="sub">Create your GamerFeed account</p>

        <div className="field">
          <label className="label">Username</label>
          <input className="input" value={form.username} onChange={(e) => update("username", e.target.value)} required />
        </div>
        <div className="field">
          <label className="label">Email</label>
          <input className="input" type="email" value={form.email} onChange={(e) => update("email", e.target.value)} required />
        </div>
        <div className="field">
          <label className="label">Password (6+ chars)</label>
          <input className="input" type="password" value={form.password} onChange={(e) => update("password", e.target.value)} required />
        </div>
        <div className="field">
          <label className="label">Bio (optional)</label>
          <textarea className="textarea" value={form.bio} onChange={(e) => update("bio", e.target.value)} />
        </div>
        {error && <div className="error-msg">{error}</div>}
        <button className="btn" style={{ width: "100%" }} disabled={busy}>
          {busy ? "Creating..." : "Create account"}
        </button>
        <div className="auth-switch">
          Have an account? <Link href="/login">Log in</Link>
        </div>
      </form>
    </div>
  );
}
