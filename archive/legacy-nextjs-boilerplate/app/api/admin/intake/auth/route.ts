import { createHash, timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";

const COOKIE_NAME = "pm_intake_session";
const configuredPassword = () => process.env.INTAKE_PASSWORD || "PM-INTAKE-LOCKED";
const sessionToken = () => createHash("sha256").update(`${configuredPassword()}:P1-CLOSED`).digest("hex");

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as { password?: unknown } | null;
  const supplied = typeof body?.password === "string" ? body.password : "";
  const expected = Buffer.from(configuredPassword());
  const received = Buffer.from(supplied);
  const valid = expected.length === received.length && timingSafeEqual(expected, received);

  if (!valid) {
    return NextResponse.json({ error: "INVALID_PASSWORD" }, { status: 401 });
  }

  const response = NextResponse.json({ ok: true, gate: "CLOSED", intake: "READY" });
  response.cookies.set(COOKIE_NAME, sessionToken(), {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 30,
    path: "/admin/intake",
  });
  return response;
}
