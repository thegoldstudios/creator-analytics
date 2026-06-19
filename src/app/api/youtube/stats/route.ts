import { NextRequest, NextResponse } from "next/server";

const API_KEY = process.env.YOUTUBE_API_KEY ?? "";

export async function GET(req: NextRequest) {
  const handle = req.nextUrl.searchParams.get("handle");
  if (!handle) return NextResponse.json({ error: "Missing handle" }, { status: 400 });
  if (!API_KEY) return NextResponse.json({ error: "YouTube API not configured" }, { status: 503 });

  const url = `https://www.googleapis.com/youtube/v3/channels?part=statistics,snippet&forHandle=${handle}&key=${API_KEY}`;
  const res = await fetch(url, { next: { revalidate: 3600 } }); // cache 1 hour
  if (!res.ok) return NextResponse.json({ error: "YouTube API error" }, { status: 502 });

  const data = await res.json();
  const channel = data.items?.[0];
  if (!channel) return NextResponse.json({ error: "Channel not found" }, { status: 404 });

  const stats = channel.statistics;
  return NextResponse.json({
    channelId: channel.id,
    title: channel.snippet.title,
    subscribers: parseInt(stats.subscriberCount ?? "0"),
    totalViews: parseInt(stats.viewCount ?? "0"),
    videoCount: parseInt(stats.videoCount ?? "0"),
    thumbnail: channel.snippet.thumbnails?.default?.url ?? null,
  });
}
