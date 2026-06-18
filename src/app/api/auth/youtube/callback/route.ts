import { NextRequest, NextResponse } from "next/server";
import { creators } from "@/lib/mock-data";
import { storeToken } from "@/lib/kv";

const CLIENT_ID = process.env.YOUTUBE_CLIENT_ID ?? "";
const CLIENT_SECRET = process.env.YOUTUBE_CLIENT_SECRET ?? "";
const REDIRECT_URI = process.env.NEXT_PUBLIC_BASE_URL
  ? `${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/youtube/callback`
  : "https://creator-analytics-ja5p.vercel.app/api/auth/youtube/callback";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const code = searchParams.get("code");
  const shareToken = searchParams.get("state");
  const error = searchParams.get("error");

  if (error || !code || !shareToken) {
    return NextResponse.redirect(
      new URL(`/connect/${shareToken ?? ""}?error=cancelled`, req.url)
    );
  }

  const creator = creators.find((c) => c.shareToken === shareToken);
  if (!creator) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      redirect_uri: REDIRECT_URI,
      grant_type: "authorization_code",
    }),
  });

  if (!tokenRes.ok) {
    return NextResponse.redirect(
      new URL(`/connect/${shareToken}?error=token`, req.url)
    );
  }

  const tokens = await tokenRes.json();
  await storeToken(creator.id, "youtube", {
    access_token: tokens.access_token,
    refresh_token: tokens.refresh_token ?? "",
    expires_at: String(Date.now() + tokens.expires_in * 1000),
  });

  return NextResponse.redirect(new URL(`/connect/${shareToken}?success=youtube`, req.url));
}
