// avatar component. The user.avatarUrl is now just the URL of a lucide SVG icon
// (we removed the upload-an-image flow, the spec said keep it simple).
// If theres no avatarUrl we just show the first letter of the username.
import { colorForId } from "@/lib/avatars";

export default function Avatar({ user, size = "md" }) {
  const cls = size === "lg" ? "avatar lg" : size === "sm" ? "small-avatar" : "avatar";
  const letter = (user?.username || "?").charAt(0).toUpperCase();
  const tint = colorForId(user?.id || 0);

  if (user?.avatarUrl) {
    // lucide-static svgs are black by default, we drop them in then tint with css
    // using a colored background tile so the icon pops out
    return (
      <div className={cls} style={{ background: tint }}>
        <img src={user.avatarUrl} alt={user.username} className="avatar-icon" />
      </div>
    );
  }
  return <div className={cls}>{letter}</div>;
}
