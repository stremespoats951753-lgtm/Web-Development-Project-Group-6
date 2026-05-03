"use client";
// hook used by every page to know who the current user is
// IMPORTANT: this no longer redirects to /login. The site is browseable
// as a guest, only specific actions (like, comment, follow, post...) need
// auth. Those actions use the requireLogin() helper below.
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function useRequireAuth() {
  const [me, setMe] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => {
        if (!alive) return;
        setMe(d.user || null);   // null = guest, that is fine
        setLoading(false);
      })
      .catch(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, []);

  return { me, loading };
}

// helper: call this from any "action" handler. Returns true if the user is
// loged in, otherwise pops a confirm and sends them to /login.
// usage:
//   if (!requireLogin(me, router)) return;
//   await fetch("...like...");
export function requireLogin(me, router, msg = "You need an account to do that.") {
  if (me) return true;
  if (typeof window !== "undefined" && window.confirm(msg + "\n\nGo to login page?")) {
    router.push("/login");
  }
  return false;
}
