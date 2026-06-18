import { NextRequest, NextResponse } from "next/server";
import { creators } from "@/lib/mock-data";
import { getConnectedPlatforms } from "@/lib/kv";

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token");
  if (!token) return NextResponse.json({ error: "Missing token" }, { status: 400 });

  const creator = creators.find((c) => c.shareToken === token);
  if (!creator) return NextResponse.json({ error: "Creator not found" }, { status: 404 });

  const connected = await getConnectedPlatforms(creator.id);

  return NextResponse.json({
    creatorId: creator.id,
    name: creator.name,
    platforms: creator.platforms,
    connected,
  });
}
