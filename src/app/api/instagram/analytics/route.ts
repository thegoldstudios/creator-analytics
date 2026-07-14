import { NextRequest, NextResponse } from "next/server";
import { refreshInstagramToken } from "@/lib/kv";

export async function GET(req: NextRequest) {
  const creatorId = req.nextUrl.searchParams.get("creatorId");
  if (!creatorId) return NextResponse.json({ error: "Missing creatorId" }, { status: 400 });

  const auth = await refreshInstagramToken(creatorId);
  if (!auth) return NextResponse.json({ error: "Not connected" }, { status: 401 });

  const { accessToken, userId } = auth;
  const base = `https://graph.instagram.com/v21.0`;

  // Fetch account basic info + follower count
  const profileRes = await fetch(
    `${base}/${userId}?fields=username,followers_count,media_count,biography&access_token=${accessToken}`
  );

  if (!profileRes.ok) {
    const err = await profileRes.text().catch(() => "");
    return NextResponse.json({ error: "Instagram API error", detail: err }, { status: 502 });
  }

  const profile = await profileRes.json();

  // Fetch recent media for engagement calculation (last 25 posts)
  const mediaRes = await fetch(
    `${base}/${userId}/media?fields=like_count,comments_count,impressions,reach,media_type,timestamp&limit=25&access_token=${accessToken}`
  );

  // Fetch insights: follower demographics require instagram_business_manage_insights
  const insightsRes = await fetch(
    `${base}/${userId}/insights?metric=follower_demographics&period=lifetime&metric_type=total_value&breakdown=age,gender&access_token=${accessToken}`
  );

  const geoRes = await fetch(
    `${base}/${userId}/insights?metric=follower_demographics&period=lifetime&metric_type=total_value&breakdown=country&access_token=${accessToken}`
  );

  const followers = profile.followers_count ?? 0;
  const mediaCount = profile.media_count ?? 0;

  let totalLikes = 0, totalComments = 0, totalImpressions = 0, totalReach = 0;
  let postCount = 0;

  if (mediaRes.ok) {
    const mediaData = await mediaRes.json();
    const posts = mediaData.data ?? [];
    for (const post of posts) {
      totalLikes += post.like_count ?? 0;
      totalComments += post.comments_count ?? 0;
      totalImpressions += post.impressions ?? 0;
      totalReach += post.reach ?? 0;
      postCount++;
    }
  }

  const avgViews = postCount > 0 ? Math.round(totalReach / postCount) : 0;
  const avgLikes = postCount > 0 ? Math.round(totalLikes / postCount) : 0;
  const avgComments = postCount > 0 ? Math.round(totalComments / postCount) : 0;
  const engagementRate = totalReach > 0 ? parseFloat(((totalLikes + totalComments) / totalReach * 100).toFixed(2)) : 0;
  const followerEngRate = followers > 0 ? parseFloat(((totalLikes + totalComments) / followers * 100).toFixed(2)) : 0;

  // Demographics
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

  let gender = { male: 0, female: 0 };
  let ageGender = { all: [] as { label: string; value: number }[], male: [] as { label: string; value: number }[], female: [] as { label: string; value: number }[] };
  let topCountries: { country: string; flag: string; pct: number }[] = [];

  if (insightsRes.ok) {
    const insightsData = await insightsRes.json();
    const breakdowns = insightsData.data?.[0]?.total_value?.breakdowns ?? [];
    for (const breakdown of breakdowns) {
      if (breakdown.dimension_keys?.includes("age") && breakdown.dimension_keys?.includes("gender")) {
        const results = breakdown.results ?? [];
        const byAge: Record<string, { male: number; female: number }> = {};
        let maleTotal = 0, femaleTotal = 0;
        for (const r of results) {
          const [age, genderKey] = r.dimension_values ?? [];
          const val = r.value ?? 0;
          if (!byAge[age]) byAge[age] = { male: 0, female: 0 };
          if (genderKey === "M") { byAge[age].male += val; maleTotal += val; }
          else if (genderKey === "F") { byAge[age].female += val; femaleTotal += val; }
        }
        const total = maleTotal + femaleTotal || 1;
        gender = {
          male: parseFloat((maleTotal / total * 100).toFixed(1)),
          female: parseFloat((femaleTotal / total * 100).toFixed(1)),
        };
        const AGE_ORDER = ["13-17", "18-24", "25-34", "35-44", "45-54", "55-64", "65+"];
        ageGender = {
          all: AGE_ORDER.map((a) => ({ label: a, value: parseFloat((((byAge[a]?.male ?? 0) + (byAge[a]?.female ?? 0)) / total * 100).toFixed(1)) })),
          male: AGE_ORDER.map((a) => ({ label: a, value: parseFloat(((byAge[a]?.male ?? 0) / total * 100).toFixed(1)) })),
          female: AGE_ORDER.map((a) => ({ label: a, value: parseFloat(((byAge[a]?.female ?? 0) / total * 100).toFixed(1)) })),
        };
      }
    }
  }

  if (geoRes.ok) {
    const geoData = await geoRes.json();
    const breakdowns = geoData.data?.[0]?.total_value?.breakdowns ?? [];
    for (const breakdown of breakdowns) {
      if (breakdown.dimension_keys?.includes("country")) {
        const results: { dimension_values: string[]; value: number }[] = breakdown.results ?? [];
        const total = results.reduce((s: number, r: { dimension_values: string[]; value: number }) => s + r.value, 0) || 1;
        topCountries = results
          .sort((a: { dimension_values: string[]; value: number }, b: { dimension_values: string[]; value: number }) => b.value - a.value)
          .slice(0, 5)
          .map((r: { dimension_values: string[]; value: number }) => {
            const code = r.dimension_values[0];
            return {
              country: COUNTRY_NAMES[code] ?? code,
              flag: COUNTRY_FLAGS[code] ?? "🌍",
              pct: parseFloat((r.value / total * 100).toFixed(1)),
            };
          });
      }
    }
  }

  return NextResponse.json({
    followers,
    mediaCount,
    totalImpressions,
    totalLikes,
    totalComments,
    avgViews,
    avgLikes,
    avgComments,
    engagementRate,
    followerEngagementRate: followerEngRate,
    gender,
    ageGender,
    topCountries,
    live: true,
  });
}
