import { NextRequest, NextResponse } from "next/server";
import { refreshYouTubeToken } from "@/lib/kv";

export async function GET(req: NextRequest) {
  const creatorId = req.nextUrl.searchParams.get("creatorId");
  if (!creatorId) return NextResponse.json({ error: "Missing creatorId" }, { status: 400 });

  const accessToken = await refreshYouTubeToken(creatorId);
  if (!accessToken) return NextResponse.json({ error: "Not connected" }, { status: 401 });

  // Date range: last 365 days
  const endDate = new Date().toISOString().split("T")[0];
  const startDate = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];

  const headers = { Authorization: `Bearer ${accessToken}` };

  const [channelRes, analyticsRes, geoRes, demoRes, topVideoRes] = await Promise.all([
    fetch("https://www.googleapis.com/youtube/v3/channels?part=statistics&mine=true", { headers }),
    fetch(`https://youtubeanalytics.googleapis.com/v2/reports?ids=channel==MINE&startDate=${startDate}&endDate=${endDate}&metrics=views,likes,comments,shares,estimatedMinutesWatched,subscribersGained,subscribersLost&dimensions=month&sort=month`, { headers }),
    fetch(`https://youtubeanalytics.googleapis.com/v2/reports?ids=channel==MINE&startDate=${startDate}&endDate=${endDate}&metrics=views&dimensions=country&sort=-views&maxResults=5`, { headers }),
    fetch(`https://youtubeanalytics.googleapis.com/v2/reports?ids=channel==MINE&startDate=${startDate}&endDate=${endDate}&metrics=viewerPercentage&dimensions=ageGroup,gender`, { headers }),
    fetch(`https://youtubeanalytics.googleapis.com/v2/reports?ids=channel==MINE&startDate=${startDate}&endDate=${endDate}&metrics=views,likes,comments,estimatedMinutesWatched&dimensions=video&sort=-views&maxResults=1`, { headers }),
  ]);

  if (!channelRes.ok || !analyticsRes.ok) {
    const err = await analyticsRes.text().catch(() => "");
    return NextResponse.json({ error: "YouTube API error", detail: err }, { status: 502 });
  }

  const channelData = await channelRes.json();
  const analyticsData = await analyticsRes.json();
  const geoData = geoRes.ok ? await geoRes.json() : null;
  const demoData = demoRes.ok ? await demoRes.json() : null;
  const topVideoData = topVideoRes.ok ? await topVideoRes.json() : null;

  const stats = channelData.items?.[0]?.statistics ?? {};
  const subscribers = parseInt(stats.subscriberCount ?? "0");
  const totalVideos = parseInt(stats.videoCount ?? "0");

  // Sum annual totals from monthly rows
  // columns: month, views, likes, comments, shares, estimatedMinutesWatched, subscribersGained, subscribersLost
  const rows: number[][] = analyticsData.rows ?? [];
  let totalViews = 0, totalLikes = 0, totalComments = 0, totalWatchMinutes = 0;
  let subGained = 0;
  for (const row of rows) {
    totalViews += row[1] ?? 0;
    totalLikes += row[2] ?? 0;
    totalComments += row[3] ?? 0;
    totalWatchMinutes += row[5] ?? 0;
    subGained += row[6] ?? 0;
  }

  const avgViews = totalVideos > 0 ? Math.round(totalViews / totalVideos) : 0;
  const avgLikes = totalVideos > 0 ? Math.round(totalLikes / totalVideos) : 0;
  const avgComments = totalVideos > 0 ? Math.round(totalComments / totalVideos) : 0;
  const engagementRate = totalViews > 0 ? parseFloat(((totalLikes + totalComments) / totalViews * 100).toFixed(2)) : 0;
  const followerEngRate = subscribers > 0 ? parseFloat(((totalLikes + totalComments) / subscribers * 100).toFixed(2)) : 0;
  const followersGrowthPct = subscribers > 0 ? parseFloat((subGained / subscribers * 100).toFixed(1)) : 0;

  // Watch time in hours
  const watchTimeHours = Math.round(totalWatchMinutes / 60);

  // Top video: fetch title/thumbnail from Data API
  let topVideo = null;
  const topVideoRow = topVideoData?.rows?.[0];
  if (topVideoRow) {
    const videoId = topVideoRow[0];
    const videoViews = topVideoRow[1];
    const videoLikes = topVideoRow[2];
    const videoWatchMins = topVideoRow[4];
    const videoRes = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${videoId}&key=${process.env.YOUTUBE_API_KEY}`,
    );
    if (videoRes.ok) {
      const videoData = await videoRes.json();
      const snippet = videoData.items?.[0]?.snippet;
      if (snippet) {
        topVideo = {
          id: videoId,
          title: snippet.title,
          thumbnail: snippet.thumbnails?.medium?.url ?? snippet.thumbnails?.default?.url ?? null,
          url: `https://www.youtube.com/watch?v=${videoId}`,
          views: videoViews,
          likes: videoLikes,
          watchMinutes: videoWatchMins,
        };
      }
    }
  }

  // Geography
  const COUNTRY_FLAGS: Record<string, string> = {
    US: "🇺🇸", GB: "🇬🇧", AU: "🇦🇺", CA: "🇨🇦", IE: "🇮🇪",
    DE: "🇩🇪", FR: "🇫🇷", BR: "🇧🇷", IN: "🇮🇳", MX: "🇲🇽",
    NL: "🇳🇱", ES: "🇪🇸", IT: "🇮🇹", SE: "🇸🇪", NO: "🇳🇴",
  };
  const COUNTRY_NAMES: Record<string, string> = {
    US: "United States", GB: "United Kingdom", AU: "Australia", CA: "Canada",
    IE: "Ireland", DE: "Germany", FR: "France", BR: "Brazil", IN: "India",
    MX: "Mexico", NL: "Netherlands", ES: "Spain", IT: "Italy", SE: "Sweden", NO: "Norway",
  };
  const geoRows: [string, number][] = geoData?.rows ?? [];
  const geoTotal = geoRows.reduce((s, r) => s + r[1], 0);
  const topCountries = geoRows.slice(0, 5).map(([code, views]) => ({
    country: COUNTRY_NAMES[code] ?? code,
    flag: COUNTRY_FLAGS[code] ?? "🌍",
    pct: geoTotal > 0 ? parseFloat((views / geoTotal * 100).toFixed(1)) : 0,
  }));

  // Demographics
  const demoRows: [string, string, number][] = demoData?.rows ?? [];
  const AGE_LABELS: Record<string, string> = {
    "age13-17": "13–17", "age18-24": "18–24", "age25-34": "25–34",
    "age35-44": "35–44", "age45-54": "45–54", "age55-64": "55–64", "age65-": "65+",
  };
  const maleByAge: Record<string, number> = {};
  const femaleByAge: Record<string, number> = {};
  let malePct = 0, femalePct = 0;
  for (const [age, gender, pct] of demoRows) {
    if (gender === "male") { maleByAge[age] = pct; malePct += pct; }
    else if (gender === "female") { femaleByAge[age] = pct; femalePct += pct; }
  }
  const ageGroups = Object.keys(AGE_LABELS);
  const allBars = ageGroups.map((a) => ({ label: AGE_LABELS[a], value: parseFloat(((maleByAge[a] ?? 0) + (femaleByAge[a] ?? 0)).toFixed(1)) }));
  const maleBars = ageGroups.map((a) => ({ label: AGE_LABELS[a], value: parseFloat((maleByAge[a] ?? 0).toFixed(1)) }));
  const femaleBars = ageGroups.map((a) => ({ label: AGE_LABELS[a], value: parseFloat((femaleByAge[a] ?? 0).toFixed(1)) }));

  return NextResponse.json({
    subscribers,
    totalVideos,
    totalViews,
    totalImpressions: 0,
    totalLikes,
    totalComments,
    avgViews,
    avgLikes,
    avgComments,
    engagementRate,
    followerEngagementRate: followerEngRate,
    followersGrowthPct,
    watchTimeHours,
    topVideo,
    gender: {
      male: parseFloat(malePct.toFixed(1)),
      female: parseFloat(femalePct.toFixed(1)),
    },
    ageGender: { all: allBars, male: maleBars, female: femaleBars },
    topCountries,
    live: true,
  });
}
