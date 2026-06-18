import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

const CLIENT_KEY = process.env.TIKTOK_CLIENT_KEY ?? "";
const REDIRECT_URI = process.env.NEXT_PUBLIC_BASE_URL
  ? `${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/tiktok/callback`
  : "https://creator-analytics-ja5p.vercel.app/api/auth/tiktok/callback";

const SCOPES = "user.info.basic,user.info.stats,video.list";

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token");
  if (!token) return NextResponse.json({ error: "Missing token" }, { status: 400 });

  if (!CLIENT_KEY) {
    return NextResponse.json({ error: "TikTok OAuth not configured yet." }, { status: 503 });
  }

  const csrfState = crypto.randomBytes(16).toString("hex");
  // Encode shareToken + csrfState together in state param
  const state = `${token}:${csrfState}`;

  const params = new URLSearchParams({
    client_key: CLIENT_KEY,
    scope: SCOPES,
    response_type: "code",
    redirect_uri: REDIRECT_URI,
    state,
  });

  return NextResponse.redirect(
    `https://www.tiktok.com/v2/auth/authorize/?${params.toString()}`
  );
}
