import { NextRequest, NextResponse } from "next/server";
import { TEAM_PASSWORD, SESSION_COOKIE, makeToken } from "@/lib/session";

export async function POST(req: NextRequest) {
  const { password } = await req.json();

  if (password !== TEAM_PASSWORD) {
    return NextResponse.json({ error: "Incorrect password" }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set(SESSION_COOKIE, makeToken(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 30, // 30 days
    path: "/",
  });
  return res;
}
