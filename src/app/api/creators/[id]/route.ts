import { NextRequest, NextResponse } from "next/server";
import { getCreatorById, upsertCreator, deleteCreator } from "@/lib/creators-store";
import { Agent, Platform } from "@/lib/types";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const existing = await getCreatorById(id);
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await req.json();

  const updated = {
    ...existing,
    ...(body.name !== undefined ? { name: body.name } : {}),
    ...(body.handle !== undefined ? { handle: body.handle } : {}),
    ...(body.category !== undefined ? { category: body.category } : {}),
    ...(body.agent !== undefined ? { agent: body.agent as Agent } : {}),
    ...(body.platforms !== undefined ? { platforms: body.platforms as Platform[] } : {}),
    ...(body.youtubeHandle !== undefined ? { youtubeHandle: body.youtubeHandle } : {}),
  };

  // Recalculate initials if name changed
  if (body.name) {
    const parts = body.name.replace(/[|].*/g, "").trim().split(" ");
    updated.avatar = parts.length >= 2
      ? (parts[0][0] + parts[1][0]).toUpperCase()
      : parts[0].substring(0, 2).toUpperCase();
  }

  await upsertCreator(updated);
  return NextResponse.json(updated);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await deleteCreator(id);
  return NextResponse.json({ ok: true });
}
