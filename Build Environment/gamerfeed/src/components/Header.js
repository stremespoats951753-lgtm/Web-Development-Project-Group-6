"use client";
// the top header with logo, nav links and logout button
// shows on every page except login/register
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { Home, User, Compass, BarChart3, LogOut, Users } from "lucide-react";

export default function Header({ me }) {
  const router = useRouter();
  const pathname = usePathname();

  // helper to highlight the active link
  function navClass(href) {
    return "nav-link" + (pathname === href ? " active" : "");
  }

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <header className="app-header">
      <Link href="/feed" className="logo">
        GAMER<span>FEED</span>
      </Link>

      <nav className="nav-links">
        <Link href="/feed" className={navClass("/feed")}>
          <Home size={16} /> Feed
        </Link>
        <Link href="/following" className={navClass("/following")}>
          <Users size={16} /> Following
        </Link>
        <Link href="/explore" className={navClass("/explore")}>
          <Compass size={16} /> Explore
        </Link>
        <Link href="/stats" className={navClass("/stats")}>
          <BarChart3 size={16} /> Stats
        </Link>
        {me && (
          <Link href={`/profile/${me.id}`} className={navClass(`/profile/${me.id}`)}>
            <User size={16} /> Profile
          </Link>
        )}
      </nav>

      <div className="spacer" />

      {me ? (
        <>
          <span className="muted" style={{ fontSize: 13 }}>
            @{me.username}
          </span>
          <button className="btn btn-ghost" onClick={handleLogout}>
            <LogOut size={14} /> Logout
          </button>
        </>
      ) : (
        <Link href="/login" className="btn">Login</Link>
      )}
    </header>
  );
}
