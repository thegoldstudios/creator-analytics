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
