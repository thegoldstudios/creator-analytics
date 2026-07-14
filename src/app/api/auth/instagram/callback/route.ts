import { NextRequest, NextResponse } from "next/server";
import { getAllCreators } from "@/lib/creators-store";
import { storeToken } from "@/lib/kv";

const CLIENT_ID = process.env.INSTAGRAM_CLIENT_ID ?? "";
const CLIENT_SECRET = process.env.INSTAGRAM_CLIENT_SECRET ?? "";
const REDIRECT_URI = process.env.NEXT_PUBLIC_BASE_URL
  ? `${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/instagram/callback`
  : "https://creator-analytics-ja5p.vercel.app/api/auth/instagram/callback";

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

  const all = await getAllCreators();
  const creator = all.find((c) => c.shareToken === shareToken);
  if (!creator) return NextResponse.redirect(new URL("/", req.url));

  // Exchange code for short-lived token
  const tokenRes = await fetch("https://api.instagram.com/oauth/access_token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      grant_type: "authorization_code",
      redirect_uri: REDIRECT_URI,
      code,
    }),
  });

  if (!tokenRes.ok) {
    return NextResponse.redirect(new URL(`/connect/${shareToken}?error=token`, req.url));
  }

  const { access_token, user_id } = await tokenRes.json();

  // Exchange for long-lived token (60 days)
  const longRes = await fetch(
    `https://graph.instagram.com/access_token?grant_type=ig_exchange_token&client_secret=${CLIENT_SECRET}&access_token=${access_token}`
  );
  const longData = longRes.ok ? await longRes.json() : {};

  await storeToken(creator.id, "instagram", {
    access_token: longData.access_token ?? access_token,
    user_id: String(user_id),
    expires_at: String(Date.now() + (longData.expires_in ?? 5184000) * 1000),
  });

  return NextResponse.redirect(new URL(`/connect/${shareToken}?success=instagram`, req.url));
}
