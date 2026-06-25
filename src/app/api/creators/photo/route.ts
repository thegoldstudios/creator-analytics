import { NextRequest, NextResponse } from "next/server";

const YT_API_KEY = process.env.YOUTUBE_API_KEY ?? "";

export async function GET(req: NextRequest) {
  const handle = req.nextUrl.searchParams.get("youtubeHandle");
  if (!handle) return NextResponse.json({ error: "Missing youtubeHandle" }, { status: 400 });

  if (!YT_API_KEY) return NextResponse.json({ error: "YouTube API not configured" }, { status: 503 });

  // Try by handle (@handle format)
  const searchHandle = handle.startsWith("@") ? handle : `@${handle}`;
  const url = `https://www.googleapis.com/youtube/v3/channels?part=snippet&forHandle=${encodeURIComponent(searchHandle)}&key=${YT_API_KEY}`;

  const res = await fetch(url);
  const data = await res.json();

  const channel = data.items?.[0];
  if (!channel) return NextResponse.json({ error: "Channel not found" }, { status: 404 });

  const photoUrl =
    channel.snippet?.thumbnails?.high?.url ??
    channel.snippet?.thumbnails?.medium?.url ??
    channel.snippet?.thumbnails?.default?.url ??
    null;

  if (!photoUrl) return NextResponse.json({ error: "No thumbnail found" }, { status: 404 });

  return NextResponse.json({ photoUrl, channelTitle: channel.snippet?.title });
}
