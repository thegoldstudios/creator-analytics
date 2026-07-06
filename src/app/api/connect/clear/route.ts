import { NextRequest, NextResponse } from "next/server";
import { kv } from "@vercel/kv";

export async function POST(req: NextRequest) {
  const { creatorId, platform } = await req.json();
  if (!creatorId || !platform) {
    return NextResponse.json({ error: "Missing creatorId or platform" }, { status: 400 });
  }
  await kv.del(`tokens:${creatorId}:${platform}`);
  return NextResponse.json({ ok: true });
}
