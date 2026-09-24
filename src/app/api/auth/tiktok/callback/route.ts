import { NextRequest, NextResponse } from "next/server";
import { getAllCreators } from "@/lib/creators-store";
import { storeToken } from "@/lib/kv";

const CLIENT_KEY = process.env.TIKTOK_CLIENT_KEY ?? "";
const CLIENT_SECRET = process.env.TIKTOK_CLIENT_SECRET ?? "";
const REDIRECT_URI = process.env.NEXT_PUBLIC_BASE_URL
  ? `${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/tiktok/callback`
  : "https://creator-analytics-ja5p.vercel.app/api/auth/tiktok/callback";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const code = searchParams.get("code");
  const state = searchParams.get("state") ?? "";
  const error = searchParams.get("error");

  // state = "shareToken:csrfState"
  const shareToken = state.split(":")[0];

  if (error || !code || !shareToken) {
    return NextResponse.redirect(
      new URL(`/connect/${shareToken ?? ""}?error=cancelled`, req.url)
    );
  }

  const all = await getAllCreators();
  const creator = all.find((c) => c.shareToken === shareToken);
  if (!creator) {
    console.error(`[tiktok callback] no creator found for shareToken=${shareToken}`);
    return NextResponse.redirect(new URL(`/connect/${shareToken}?error=creator`, req.url));
  }

  try {
    const tokenRes = await fetch("https://open.tiktokapis.com/v2/oauth/token/", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_key: CLIENT_KEY,
        client_secret: CLIENT_SECRET,
        code,
        grant_type: "authorization_code",
        redirect_uri: REDIRECT_URI,
      }),
    });

    if (!tokenRes.ok) {
      const detail = await tokenRes.text().catch(() => "");
      console.error(`[tiktok callback] token exchange failed (${tokenRes.status}): ${detail}`);
      return NextResponse.redirect(new URL(`/connect/${shareToken}?error=token`, req.url));
    }

    const tokens = await tokenRes.json();
    if (!tokens.access_token) {
      console.error(`[tiktok callback] token exchange returned no access_token: ${JSON.stringify(tokens)}`);
      return NextResponse.redirect(new URL(`/connect/${shareToken}?error=token`, req.url));
    }

    await storeToken(creator.id, "tiktok", {
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token ?? "",
      open_id: tokens.open_id ?? "",
      expires_at: String(Date.now() + (tokens.expires_in ?? 86400) * 1000),
    });

    return NextResponse.redirect(new URL(`/connect/${shareToken}?success=tiktok`, req.url));
  } catch (err) {
    console.error(`[tiktok callback] unexpected error:`, err);
    return NextResponse.redirect(new URL(`/connect/${shareToken}?error=token`, req.url));
  }
}
