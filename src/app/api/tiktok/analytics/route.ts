import { NextRequest, NextResponse } from "next/server";
import { refreshTikTokToken } from "@/lib/kv";

export async function GET(req: NextRequest) {
  const creatorId = req.nextUrl.searchParams.get("creatorId");
  if (!creatorId) return NextResponse.json({ error: "Missing creatorId" }, { status: 400 });

  const auth = await refreshTikTokToken(creatorId);
  if (!auth) return NextResponse.json({ error: "Not connected" }, { status: 401 });

  const { accessToken } = auth;

  const profileRes = await fetch(
    "https://open.tiktokapis.com/v2/user/info/?fields=display_name,avatar_url,follower_count,following_count,likes_count,video_count",
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );

  if (!profileRes.ok) {
    const detail = await profileRes.text().catch(() => "");
    return NextResponse.json({ error: "TikTok API error", detail }, { status: 502 });
  }

  const profileJson = await profileRes.json();
  const user = profileJson.data?.user ?? {};

  const followers = user.follower_count ?? 0;
  const videoCount = user.video_count ?? 0;

  // Fetch recent videos for engagement calculation (video.list scope)
  const videoRes = await fetch(
    "https://open.tiktokapis.com/v2/video/list/?fields=view_count,like_count,comment_count,share_count",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ max_count: 20 }),
    }
  );

  let totalViews = 0, totalLikes = 0, totalComments = 0, postCount = 0;

  if (videoRes.ok) {
    const videoJson = await videoRes.json();
    const videos = videoJson.data?.videos ?? [];
    for (const v of videos) {
      totalViews += v.view_count ?? 0;
      totalLikes += v.like_count ?? 0;
      totalComments += v.comment_count ?? 0;
      postCount++;
    }
  }

  const avgViews = postCount > 0 ? Math.round(totalViews / postCount) : 0;
  const avgLikes = postCount > 0 ? Math.round(totalLikes / postCount) : 0;
  const avgComments = postCount > 0 ? Math.round(totalComments / postCount) : 0;
  const engagementRate = totalViews > 0
    ? parseFloat(((totalLikes + totalComments) / totalViews * 100).toFixed(2))
    : 0;
  const followerEngagementRate = followers > 0
    ? parseFloat(((totalLikes + totalComments) / followers * 100).toFixed(2))
    : 0;

  return NextResponse.json({
    followers,
    totalVideos: videoCount,
    totalImpressions: totalViews,
    totalLikes,
    totalComments,
    avgViews,
    avgLikes,
    avgComments,
    engagementRate,
    followerEngagementRate,
    live: true,
  });
}
