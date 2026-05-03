// GET comments / POST new comment for a post
import { getCommentsForPost, addComment } from "@/repositories/postRepo";
import { getCurrentUser } from "@/lib/session";
import { json, unauthorized, badRequest } from "@/lib/api";

export async function GET(_req, { params }) {
  const { id } = await params;
  const comments = await getCommentsForPost(Number(id));
  return json({ comments })
}

export async function POST(req, { params }) {
  const { id } = await params;
  const me = await getCurrentUser();
  if (!me) return unauthorized();
  const { content } = await req.json();
  if (!content || !content.trim()) return badRequest("Empty comment");
  const c = await addComment(Number(id), me.id, content.trim());
  return json({ comment: c });
}
