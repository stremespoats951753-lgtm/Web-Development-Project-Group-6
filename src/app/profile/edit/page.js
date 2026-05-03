"use client";
// edit own profile: bio + RANDOM avatar.
// Avatars are now just lucide icon URLs stored as a string in the db.
// Click "Randomize" and the server picks a new icon and saves the URL.
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Shuffle } from "lucide-react";
import Header from "@/components/Header";
import Avatar from "@/components/Avatar";
import useRequireAuth from "@/components/useRequireAuth";

export default function EditProfilePage() {
  const { me, loading } = useRequireAuth();
  const router = useRouter();
  const [bio, setBio] = useState("");
  const [user, setUser] = useState(null); // local copy so the avatar updates live
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    if (me) {
      setBio(me.bio || "");
      setUser(me);
    }
  }, [me]);

  if (loading) return null;
  if (!me) {
    if (typeof window !== "undefined") location.href = "/login";
    return null;
  }

  async function saveBio() {
    setBusy(true);
    const res = await fetch("/api/users/me", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bio }),
    });
    setBusy(false);
    setMsg(res.ok ? "Saved!" : "Could not save");
    router.refresh();
  }

  // ask the server to pick a random lucide icon and save it as my avatar
  async function randomizeAvatar() {
    setBusy(true);
    const res = await fetch("/api/users/me/avatar", { method: "POST" });
    setBusy(false);
    if (res.ok) {
      const d = await res.json();
      setUser(d.user); // reflect the new icon immediatly
      setMsg("New avatar: " + d.icon);
    } else {
      setMsg("Could not change avatar");
    }
  }

  return (
    <>
      <Header me={me} />
      <main className="app-layout" style={{ gridTemplateColumns: "1fr" }}>
        <section style={{ maxWidth: 600, margin: "0 auto", width: "100%" }}>
          <div className="card">
            <h1 style={{ marginBottom: 14 }}>Edit profile</h1>

            <div className="hstack" style={{ marginBottom: 14, flexWrap: "wrap" }}>
              <Avatar user={user || me} size="lg" />
              <div style={{ flex: 1, minWidth: 200 }}>
                <label className="label">Profile picture</label>
                <button className="btn" onClick={randomizeAvatar} disabled={busy}>
                  <Shuffle size={14} /> Randomize avatar
                </button>
                <p className="muted" style={{ fontSize: 12, marginTop: 6 }}>
                  Picks a random icon from <a href="https://lucide.dev" target="_blank" rel="noopener">lucide.dev</a>{" "}
                  and stores its URL on your profile.
                </p>
              </div>
            </div>

            <div className="field">
              <label className="label">Bio</label>
              <textarea className="textarea" value={bio} onChange={(e) => setBio(e.target.value)} />
            </div>

            <button className="btn" onClick={saveBio} disabled={busy}>
              {busy ? "Saving..." : "Save bio"}
            </button>
            {msg && <span className="muted" style={{ marginLeft: 10 }}>{msg}</span>}
          </div>
        </section>
      </main>
    </>
  );
}
