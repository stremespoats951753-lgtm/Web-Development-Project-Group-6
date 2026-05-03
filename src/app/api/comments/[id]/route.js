// DELETE /api/comments/[id] - only the comment author can delete
// (this is the fix for the "comments cant be deleted" feedback you mentioned)
import { deleteComment } from "@/repositories/postRepo";
import { getCurrentUser } from "@/lib/session";
import { json, unauthorized } from "@/lib/api";

export async function DELETE(_req, { params }) {
  const me = await getCurrentUser();
  if (!me) return unauthorized();
  const { id } = await params;
  const ok = await deleteComment(Number(id), me.id);
  if (!ok) return json({ error: "Cant delete" }, 403);
  return json({ ok: true });
}
