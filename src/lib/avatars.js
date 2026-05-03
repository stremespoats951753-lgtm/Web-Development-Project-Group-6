// list of lucide.dev icon names used as user avatars
// we just store the icon name string in the database, then build the SVG URL
// from it on the client. Keeps the db tiny (no file uploads, no s3, etc).
// docs: https://lucide.dev/icons/
export const AVATAR_ICONS = [
  "gamepad-2", "joystick", "swords", "trophy", "rocket", "ghost", "skull",
  "crown", "flame", "zap", "star", "heart", "bomb", "dice-5", "sword",
  "shield", "target", "cat", "dog", "bird", "rabbit", "fish", "axe",
  "puzzle", "keyboard", "headphones", "music", "wand", "bot",
];

// pick a random one, used by the "randomize" button + the seeder
export function randomAvatarIcon() {
  return AVATAR_ICONS[Math.floor(Math.random() * AVATAR_ICONS.length)];
}

// pick a stable colour for a user based on their id
// just so each user gets a consistent looking avatar tile
const PALETTE = ["#00f5a0", "#f5a623", "#ff2e88", "#00d4ff", "#9b6bff", "#ff7a59"];
export function colorForId(id) {
  const n = typeof id === "number" ? id : 0;
  return PALETTE[n % PALETTE.length];
}

// build the lucide CDN url for an icon name + colour
// using unpkg static svg, no js bundle needed
// example: https://unpkg.com/lucide-static@latest/icons/gamepad-2.svg
export function lucideUrl(name) {
  const safe = (name || "gamepad-2").toLowerCase().replace(/[^a-z0-9-]/g, "");
  return `https://unpkg.com/lucide-static@latest/icons/${safe}.svg`;
}
