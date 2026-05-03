// little helper for api responses, less typing in routes
// ref: https://nextjs.org/docs/app/api-reference/functions/next-response
import { NextResponse } from "next/server";

export function json(data, status = 200) {
  return NextResponse.json(data, { status });
}

export function badRequest(msg = "Bad request") {
  return json({ error: msg }, 400);
}

export function unauthorized(msg = "Not logged in") {
  return json({ error: msg }, 401);
}

export function notFound(msg = "Not found") {
  return json({ error: msg }, 404);
}
