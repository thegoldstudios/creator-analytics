// Token storage using Vercel KV (Redis)
// Falls back gracefully when KV is not yet configured

let kv: any = null;

async function getKV() {
  if (kv) return kv;
  try {
    const mod = await import("@vercel/kv");
    kv = mod.kv;
    return kv;
  } catch {
    return null;
  }
}

export async function storeToken(
  creatorId: string,
  platform: "youtube" | "instagram" | "tiktok",
  tokens: Record<string, string>
) {
  const store = await getKV();
  if (!store) return;
  await store.set(`tokens:${creatorId}:${platform}`, JSON.stringify(tokens));
}

export async function getToken(
  creatorId: string,
  platform: "youtube" | "instagram" | "tiktok"
): Promise<Record<string, string> | null> {
  const store = await getKV();
  if (!store) return null;
  const raw = await store.get(`tokens:${creatorId}:${platform}`);
  if (!raw) return null;
  return typeof raw === "string" ? JSON.parse(raw) : raw;
}

const YOUTUBE_CLIENT_ID = process.env.YOUTUBE_CLIENT_ID ?? "";
const YOUTUBE_CLIENT_SECRET = process.env.YOUTUBE_CLIENT_SECRET ?? "";

export async function refreshYouTubeToken(
  creatorId: string
): Promise<string | null> {
  const token = await getToken(creatorId, "youtube");
  if (!token) return null;

  const expiresAt = parseInt(token.expires_at ?? "0");
  if (Date.now() < expiresAt - 60_000) return token.access_token;

  if (!token.refresh_token) return null;

  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: YOUTUBE_CLIENT_ID,
      client_secret: YOUTUBE_CLIENT_SECRET,
      refresh_token: token.refresh_token,
      grant_type: "refresh_token",
    }),
  });

  if (!res.ok) return null;
  const data = await res.json();

  const updated = {
    ...token,
    access_token: data.access_token,
    expires_at: String(Date.now() + data.expires_in * 1000),
  };
  await storeToken(creatorId, "youtube", updated);
  return data.access_token;
}

const INSTAGRAM_CLIENT_SECRET = process.env.INSTAGRAM_CLIENT_SECRET ?? "";

export async function refreshInstagramToken(
  creatorId: string
): Promise<{ accessToken: string; userId: string } | null> {
  const token = await getToken(creatorId, "instagram");
  if (!token) return null;

  const expiresAt = parseInt(token.expires_at ?? "0");
  // Refresh if within 7 days of expiry
  if (Date.now() < expiresAt - 7 * 24 * 60 * 60 * 1000) {
    return { accessToken: token.access_token, userId: token.user_id };
  }

  const res = await fetch(
    `https://graph.instagram.com/refresh_access_token?grant_type=ig_refresh_token&access_token=${token.access_token}&client_secret=${INSTAGRAM_CLIENT_SECRET}`
  );
  if (!res.ok) return { accessToken: token.access_token, userId: token.user_id };

  const data = await res.json();
  const updated = {
    ...token,
    access_token: data.access_token ?? token.access_token,
    expires_at: String(Date.now() + (data.expires_in ?? 5184000) * 1000),
  };
  await storeToken(creatorId, "instagram", updated);
  return { accessToken: updated.access_token, userId: token.user_id };
}

export async function getConnectedPlatforms(creatorId: string): Promise<string[]> {
  const store = await getKV();
  if (!store) return [];
  const platforms = ["youtube", "instagram", "tiktok"];
  const connected: string[] = [];
  for (const p of platforms) {
    const token = await store.get(`tokens:${creatorId}:${p}`);
    if (token) connected.push(p);
  }
  return connected;
}
