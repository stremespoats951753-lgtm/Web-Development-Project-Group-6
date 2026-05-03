// GET single post + DELETE post (owner only)
import { getPostById, deletePost } from "@/repositories/postRepo";
import { getCurrentUser } from "@/lib/session";
import { json, notFound, unauthorized } from "@/lib/api";

export async function GET(_req, { params }) {
  const { id } = await params;
  const me = await getCurrentUser();
  const p = await getPostById(Number(id), me?.id);
  if (!p) return notFound();
  return json({ post: p });
}

export async function DELETE(_req, { params }) {
  const { id } = await params;
  const me = await getCurrentUser();
  if (!me) return unauthorized();
  const ok = await deletePost(Number(id), me.id);
  if (!ok) return json({ error: "Cant delete" }, 403);
  return json({ ok: true });
}
