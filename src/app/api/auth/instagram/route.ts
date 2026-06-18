import { NextRequest, NextResponse } from "next/server";

const CLIENT_ID = process.env.INSTAGRAM_CLIENT_ID ?? "";
const REDIRECT_URI = process.env.NEXT_PUBLIC_BASE_URL
  ? `${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/instagram/callback`
  : "https://creator-analytics-ja5p.vercel.app/api/auth/instagram/callback";

const SCOPES = "instagram_business_basic,instagram_business_manage_insights";

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token");
  if (!token) return NextResponse.json({ error: "Missing token" }, { status: 400 });

  if (!CLIENT_ID) {
    return NextResponse.json({ error: "Instagram OAuth not configured yet." }, { status: 503 });
  }

  const params = new URLSearchParams({
    client_id: CLIENT_ID,
    redirect_uri: REDIRECT_URI,
    scope: SCOPES,
    response_type: "code",
    state: token,
  });

  return NextResponse.redirect(
    `https://www.instagram.com/oauth/authorize?${params.toString()}`
  );
}
