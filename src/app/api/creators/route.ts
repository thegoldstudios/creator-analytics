import { NextRequest, NextResponse } from "next/server";
import { getAllCreators, saveAllCreators, upsertCreator } from "@/lib/creators-store";
import { Creator, Platform, Agent } from "@/lib/types";

export async function GET() {
  const creators = await getAllCreators();
  return NextResponse.json(creators);
}

export async function POST(req: NextRequest) {
  const body = await req.json();

  // Validate required fields
  if (!body.name || !body.handle) {
    return NextResponse.json({ error: "name and handle are required" }, { status: 400 });
  }

  const all = await getAllCreators();
  const newId = (Math.max(0, ...all.map((c) => parseInt(c.id) || 0)) + 1).toString();

  const slug = "share_" + body.name.toLowerCase().replace(/[^a-z0-9]/g, "_").substring(0, 20);
  const parts = body.name.replace(/[|].*/g, "").trim().split(" ");
  const initials = parts.length >= 2
    ? (parts[0][0] + parts[1][0]).toUpperCase()
    : parts[0].substring(0, 2).toUpperCase();

  const platforms: Platform[] = body.platforms ?? [];

  const creator: Creator = {
    id: newId,
    name: body.name,
    handle: body.handle,
    avatar: initials,
    category: body.category ?? "Lifestyle",
    agent: (body.agent as Agent) ?? "Maddie",
    platforms,
    analytics: {},
    shareToken: slug + "_" + newId,
    ...(body.youtubeHandle ? { youtubeHandle: body.youtubeHandle } : {}),
    ...(body.photoUrl ? { photoUrl: body.photoUrl } : {}),
  };

  await upsertCreator(creator);
  return NextResponse.json(creator, { status: 201 });
}

export async function PUT(req: NextRequest) {
  // Bulk reorder — accepts full array
  const body: Creator[] = await req.json();
  await saveAllCreators(body);
  return NextResponse.json({ ok: true });
}
