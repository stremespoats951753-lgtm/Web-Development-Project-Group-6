"use client";
// inline composer to create a new post, used on feed + profile
// guests can see it but submitting prompts for login
import { useState } from "react";
import { useRouter } from "next/navigation";
import { requireLogin } from "./useRequireAuth";

const TYPES = ["update", "achievement", "discussion"];

export default function Composer({ onPosted, me }) {
  const [content, setContent] = useState("");
  const [type, setType] = useState("update");
  const [busy, setBusy] = useState(false);
  const router = useRouter();

  async function submit() {
    if (!content.trim() || busy) return;
    if (!requireLogin(me, router, "You need an account to post.")) return;
    setBusy(true);
    const res = await fetch("/api/posts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content, type }),
    });
    setBusy(false);
    if (res.ok) {
      setContent("");
      if (onPosted) onPosted();
    }
  }

  return (
    <div className="card composer">
      <textarea
        className="textarea"
        placeholder={me ? "Whats happening in your gaming world?" : "Log in to share whats on your mind..."}
        value={content}
        onChange={(e) => setContent(e.target.value)}
      />
      <div className="composer-row">
        <div className="composer-types">
          {TYPES.map((t) => (
            <button
              key={t}
              className={t === type ? "on" : ""}
              onClick={() => setType(t)}
              type="button"
            >
              {t}
            </button>
          ))}
        </div>
        <button className="btn" onClick={submit} disabled={busy || !content.trim()}>
          {busy ? "Posting..." : "Post"}
        </button>
      </div>
    </div>
  );
}
