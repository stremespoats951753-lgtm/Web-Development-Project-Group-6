"use client";
// little widget for the right sidebar, suggests people to follow
// guests see suggestions but the Follow button asks them to login.
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Avatar from "./Avatar";
import { requireLogin } from "./useRequireAuth";

export default function SuggestedUsers({ me }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  async function load() {
    setLoading(true);
    try {
      const r = await fetch("/api/users/suggest");
      if (r.ok) {
        const d = await r.json();
        setUsers(d.users || []);
      }
    } catch (e) { /* ignore */ }
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function follow(id) {
    if (!requireLogin(me, router, "You need to log in to follow people.")) return;
    await fetch(`/api/users/${id}/follow`, { method: "POST" });
    setUsers((u) => u.filter((x) => x.id !== id));
  }

  return (
    <div className="widget">
      <div className="widget-title">Suggested for you</div>
      {loading && <div className="muted" style={{ fontSize: 13 }}>Loading...</div>}
      {!loading && users.length === 0 && (
        <div className="muted" style={{ fontSize: 13 }}>No suggestions right now</div>
      )}
      {users.map((u) => (
        <div key={u.id} className="user-row">
          <Link href={`/profile/${u.id}`}><Avatar user={u} /></Link>
          <div className="meta">
            <div className="u"><Link href={`/profile/${u.id}`}>@{u.username}</Link></div>
            <div className="b">{(u.bio || "").slice(0, 40)}</div>
          </div>
          <button className="btn btn-sm" onClick={() => follow(u.id)}>Follow</button>
        </div>
      ))}
    </div>
  );
}
