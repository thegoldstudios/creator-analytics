import { NextRequest, NextResponse } from "next/server";
import { getAllCreators } from "@/lib/creators-store";
import { getConnectedPlatforms } from "@/lib/kv";

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token");
  if (!token) return NextResponse.json({ error: "Missing token" }, { status: 400 });

  const all = await getAllCreators();
  const creator = all.find((c) => c.shareToken === token);
  if (!creator) return NextResponse.json({ error: "Creator not found" }, { status: 404 });

  let connected: string[] = [];
  try {
    connected = await getConnectedPlatforms(creator.id);
  } catch {
    // KV not configured yet — treat as no connections
  }

  return NextResponse.json({
    creatorId: creator.id,
    name: creator.name,
    platforms: creator.platforms,
    connected,
  });
}
