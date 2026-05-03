// POST = follow, DELETE = unfollow
import { follow, unfollow } from "@/repositories/followRepo";
import { getCurrentUser } from "@/lib/session";
import { json, unauthorized, badRequest } from "@/lib/api";

export async function POST(_req, { params }) {
  const { id } = await params;
  const me = await getCurrentUser();
  if (!me) return unauthorized();
  const target = Number(id);
  if (target === me.id) return badRequest("Cannot follow yourself");
  await follow(me.id, target);
  return json({ ok: true });
}

export async function DELETE(_req, { params }) {
  const { id } = await params;
  const me = await getCurrentUser();
  if (!me) return unauthorized();
  await unfollow(me.id, Number(id));
  return json({ ok: true });
}
