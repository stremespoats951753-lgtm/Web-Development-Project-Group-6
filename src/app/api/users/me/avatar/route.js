// POST /api/users/me/avatar
// picks a random lucide icon and stores its URL on the user.
// no file upload, no /public/uploads, just a string in the database.
// optionaly accepts { icon: "name" } in the body to set a specific icon.
import { getCurrentUser } from "@/lib/session";
import { updateUser } from "@/repositories/userRepo";
import { json, unauthorized } from "@/lib/api";
import { randomAvatarIcon, lucideUrl, AVATAR_ICONS } from "@/lib/avatars";

export async function POST(req) {
  const me = await getCurrentUser();
  if (!me) return unauthorized();

  // try to read an explicit icon name from the body, ignore if not given
  let icon = null;
  try {
    const body = await req.json();
    if (body && typeof body.icon === "string" && AVATAR_ICONS.includes(body.icon)) {
      icon = body.icon;
    }
  } catch (e) {
    // no body or not json, just pick a random one
  }

  if (!icon) icon = randomAvatarIcon();
  const url = lucideUrl(icon);
  const updated = await updateUser(me.id, { avatarUrl: url });
  return json({ user: updated, icon });
}
