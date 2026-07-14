"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import CreatorAvatar from "./CreatorAvatar";
import { Creator, Platform, PlatformAnalytics } from "@/lib/types";
import { formatNum, PLATFORM_LABELS } from "@/lib/mock-data";
import TopNav from "./TopNav";
import PlatformToggle from "./PlatformToggle";
import StatCard from "./StatCard";
import DemographicsPanel from "./DemographicsPanel";

interface Props {
  creator: Creator;
  isShare?: boolean;
}

type Period = "monthly" | "quarterly" | "yearly";

const PERIOD_LABELS: Record<Period, string> = {
  monthly: "Monthly",
  quarterly: "Quarterly",
  yearly: "Yearly",
};

// Scale total metrics by time period (averages are per-video so stay constant)
function applyPeriod(data: PlatformAnalytics, period: Period): PlatformAnalytics {
  const scale = period === "monthly" ? 1 / 12 : period === "quarterly" ? 1 / 4 : 1;
  const growthScale = period === "monthly" ? 1 : period === "quarterly" ? 3 : 12;
  if (scale === 1 && growthScale === 12) return data; // yearly = base
  return {
    ...data,
    totalVideos: Math.round(data.totalVideos * scale),
    totalImpressions: Math.round(data.totalImpressions * scale),
    totalEngagements: Math.round(data.totalEngagements * scale),
    followersGrowthPct: parseFloat((data.followersGrowthPct * (period === "monthly" ? 1 : growthScale / 12)).toFixed(1)),
  };
}

const Icons = {
  followers: <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
  engagement: <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  followerEng: <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  videos: <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.069A1 1 0 0121 8.82v6.361a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>,
  impressions: <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>,
  engagements: <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>,
  views: <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>,
  likes: <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>,
  comments: <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>,
};

interface TopVideo {
  id: string;
  title: string;
  thumbnail: string | null;
  url: string;
  views: number;
  likes: number;
  watchMinutes: number;
}

interface YouTubeAnalytics {
  subscribers: number;
  totalVideos: number;
  totalViews: number;
  totalImpressions: number;
  totalLikes: number;
  totalComments: number;
  avgViews: number;
  avgLikes: number;
  avgComments: number;
  engagementRate: number;
  followerEngagementRate: number;
  followersGrowthPct: number;
  watchTimeHours: number;
  topVideo: TopVideo | null;
  gender: { male: number; female: number };
  ageGender: { all: { label: string; value: number }[]; male: { label: string; value: number }[]; female: { label: string; value: number }[] };
  topCountries: { country: string; flag: string; pct: number }[];
  live: boolean;
}

export default function CreatorDashboard({ creator, isShare = false }: Props) {
  const [activePlatform, setActivePlatform] = useState<Platform>(creator.platforms[0]);
  const [period, setPeriod] = useState<Period>("yearly");
  const [ytAnalytics, setYtAnalytics] = useState<YouTubeAnalytics | null>(null);
  const [ytLive, setYtLive] = useState(false);
  const [igAnalytics, setIgAnalytics] = useState<Record<string, unknown> | null>(null);
  const [igLive, setIgLive] = useState(false);

  // Try to fetch OAuth-backed YouTube Analytics first; fall back to public API stats
  useEffect(() => {
    fetch(`/api/youtube/analytics?creatorId=${creator.id}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.live) { setYtAnalytics(d); setYtLive(true); }
      })
      .catch(() => {})
      .finally(() => {
        // If no OAuth analytics and creator has a YouTube handle, fetch public stats
        setYtAnalytics((prev) => {
          if (prev) return prev;
          if (!creator.youtubeHandle) return null;
          fetch(`/api/youtube/stats?handle=${creator.youtubeHandle}`)
            .then((r) => r.json())
            .then((d) => {
              if (d.subscribers) {
                setYtAnalytics({ subscribers: d.subscribers, totalVideos: d.videoCount, totalViews: d.totalViews, totalImpressions: 0, totalLikes: 0, totalComments: 0, avgViews: 0, avgLikes: 0, avgComments: 0, engagementRate: 0, followerEngagementRate: 0, followersGrowthPct: 0, watchTimeHours: 0, topVideo: null, gender: { male: 0, female: 0 }, ageGender: { all: [], male: [], female: [] }, topCountries: [], live: false });
              }
            })
            .catch(() => {});
          return null;
        });
      });
  }, [creator.id, creator.youtubeHandle]);

  // Fetch OAuth-backed Instagram analytics
  useEffect(() => {
    fetch(`/api/instagram/analytics?creatorId=${creator.id}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.live) { setIgAnalytics(d); setIgLive(true); }
      })
      .catch(() => {});
  }, [creator.id]);

  const isYouTubePlatform = activePlatform === "youtube_shorts" || activePlatform === "youtube_longform";
  const isInstagramPlatform = activePlatform === "instagram";
  const rawData = creator.analytics[activePlatform];

  // Overlay real YouTube analytics when available
  const ytPatched = rawData && ytAnalytics && isYouTubePlatform
    ? {
        ...rawData,
        followers: ytAnalytics.subscribers,
        totalVideos: ytAnalytics.totalVideos,
        ...(ytLive ? {
          totalImpressions: ytAnalytics.totalImpressions,
          totalEngagements: ytAnalytics.totalLikes + ytAnalytics.totalComments,
          avgViews: ytAnalytics.avgViews,
          avgLikes: ytAnalytics.avgLikes,
          avgComments: ytAnalytics.avgComments,
          engagementRate: ytAnalytics.engagementRate,
          followerEngagementRate: ytAnalytics.followerEngagementRate,
          followersGrowthPct: ytAnalytics.followersGrowthPct,
          gender: ytAnalytics.gender,
          ageGender: ytAnalytics.ageGender,
          topCountries: ytAnalytics.topCountries,
        } : {}),
      }
    : rawData;

  // Overlay real Instagram analytics when available
  const ig = igAnalytics as { followers?: number; mediaCount?: number; totalImpressions?: number; totalLikes?: number; totalComments?: number; avgViews?: number; avgLikes?: number; avgComments?: number; engagementRate?: number; followerEngagementRate?: number; gender?: { male: number; female: number }; ageGender?: { all: { label: string; value: number }[]; male: { label: string; value: number }[]; female: { label: string; value: number }[] }; topCountries?: { country: string; flag: string; pct: number }[] } | null;
  const patchedRaw = ytPatched && ig && isInstagramPlatform && igLive
    ? {
        ...ytPatched,
        followers: ig.followers ?? ytPatched.followers,
        totalVideos: ig.mediaCount ?? ytPatched.totalVideos,
        totalImpressions: ig.totalImpressions ?? ytPatched.totalImpressions,
        totalEngagements: ((ig.totalLikes ?? 0) + (ig.totalComments ?? 0)) || ytPatched.totalEngagements,
        avgViews: ig.avgViews ?? ytPatched.avgViews,
        avgLikes: ig.avgLikes ?? ytPatched.avgLikes,
        avgComments: ig.avgComments ?? ytPatched.avgComments,
        engagementRate: ig.engagementRate ?? ytPatched.engagementRate,
        followerEngagementRate: ig.followerEngagementRate ?? ytPatched.followerEngagementRate,
        ...(ig.gender ? { gender: ig.gender } : {}),
        ...(ig.ageGender?.all?.length ? { ageGender: ig.ageGender } : {}),
        ...(ig.topCountries?.length ? { topCountries: ig.topCountries } : {}),
      }
    : ytPatched;

  const data = patchedRaw ? applyPeriod(patchedRaw, period) : undefined;

  const growthLabel = period === "monthly" ? "last 30 days" : period === "quarterly" ? "last 90 days" : "last 12 months";

  return (
    <>
      <TopNav isShare={isShare} />
      <div className="max-w-5xl mx-auto px-6 py-10">

        {!isShare && (
          <Link href="/" className="inline-flex items-center gap-1 text-[13px] text-gray-400 hover:text-gray-700 mb-7 transition-colors">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            All Creators
          </Link>
        )}

        {/* Creator header */}
        <div className="flex items-center justify-between mb-8 gap-4 flex-wrap">
          <div className="flex items-center gap-4">
            {creator.photoUrl ? (
              <div className="w-14 h-14 rounded-2xl shrink-0 overflow-hidden relative">
                <Image src={creator.photoUrl} alt={creator.name} fill className="object-cover" unoptimized />
              </div>
            ) : (
              <CreatorAvatar name={creator.name} initials={creator.avatar} size="lg" />
            )}
            <div>
              <h1 className="text-[22px] font-semibold text-gray-900 tracking-tight leading-tight">{creator.name}</h1>
              <p className="text-[13px] text-gray-400 mt-0.5">{creator.handle} · {creator.category}</p>
            </div>
          </div>

          {!isShare && (
            <a
              href={`/creator/${creator.id}/export`}
              target="_blank"
              className="flex items-center gap-2 text-[13px] font-medium bg-white text-gray-700 border border-gray-200 px-4 py-2 rounded-full hover:border-gray-400 hover:text-gray-900 transition-all shrink-0"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3M3 17v3a1 1 0 001 1h16a1 1 0 001-1v-3" />
              </svg>
              Export for Brand
            </a>
          )}
        </div>

        {/* Platform Toggle */}
        <div className="mb-6">
          <PlatformToggle
            available={creator.platforms}
            active={activePlatform}
            onChange={setActivePlatform}
          />
        </div>

        {/* Period filter */}
        <div className="flex items-center gap-1.5 mb-8">
          {(["monthly", "quarterly", "yearly"] as Period[]).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-3 py-1 rounded-full text-[12px] font-medium transition-all border ${
                period === p
                  ? "bg-gray-900 text-white border-gray-900"
                  : "bg-white text-gray-500 border-gray-200 hover:border-gray-400"
              }`}
            >
              {PERIOD_LABELS[p]}
            </button>
          ))}
        </div>

        {!data ? (
          <div className="text-center py-20 text-gray-300 text-sm">No data for {PLATFORM_LABELS[activePlatform]}</div>
        ) : (
          <div className="space-y-10">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-widest text-gray-400 mb-4">Summary</p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                <StatCard label="Followers" value={formatNum(data.followers)} sub={ytAnalytics && isYouTubePlatform ? (ytLive ? "● Live from YouTube Analytics" : "● Live from YouTube") : igLive && isInstagramPlatform ? "● Live from Instagram" : `+${data.followersGrowthPct}% ${growthLabel}`} icon={Icons.followers} />
                <StatCard label="Engagement" value={`${data.engagementRate}%`} icon={Icons.engagement} />
                <StatCard label="Follower Engagement" value={`${data.followerEngagementRate}%`} icon={Icons.followerEng} />
                <StatCard label="Total Videos" value={data.totalVideos.toString()} icon={Icons.videos} />
                <StatCard label="Total Impressions" value={formatNum(data.totalImpressions)} icon={Icons.impressions} />
                <StatCard label="Total Engagements" value={formatNum(data.totalEngagements)} icon={Icons.engagements} />
                <StatCard label="Avg Views" value={formatNum(data.avgViews)} icon={Icons.views} />
                <StatCard label="Avg Likes" value={formatNum(data.avgLikes)} icon={Icons.likes} />
                <StatCard label="Avg Comments" value={data.avgComments.toString()} icon={Icons.comments} />
                {ytLive && isYouTubePlatform && ytAnalytics?.watchTimeHours != null && (
                  <StatCard
                    label="Watch Time"
                    value={formatNum(ytAnalytics.watchTimeHours) + " hrs"}
                    sub="last 12 months"
                    icon={<svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                  />
                )}
              </div>
            </div>

            {/* Top performing video — YouTube only */}
            {ytLive && isYouTubePlatform && ytAnalytics?.topVideo && (
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-widest text-gray-400 mb-4">Top Performing Video</p>
                <a
                  href={ytAnalytics.topVideo.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-white rounded-2xl border border-gray-100 p-4 flex items-center gap-4 hover:border-gray-300 transition-colors group"
                >
                  {ytAnalytics.topVideo.thumbnail && (
                    <div className="w-28 h-16 rounded-xl overflow-hidden shrink-0 relative bg-gray-100">
                      <Image src={ytAnalytics.topVideo.thumbnail} alt={ytAnalytics.topVideo.title} fill className="object-cover" unoptimized />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-[14px] font-semibold text-gray-900 truncate group-hover:text-black">{ytAnalytics.topVideo.title}</p>
                    <div className="flex items-center gap-4 mt-2">
                      <span className="text-[12px] text-gray-400">{formatNum(ytAnalytics.topVideo.views)} views</span>
                      <span className="text-[12px] text-gray-400">{formatNum(ytAnalytics.topVideo.likes)} likes</span>
                      <span className="text-[12px] text-gray-400">{formatNum(Math.round(ytAnalytics.topVideo.watchMinutes / 60))} hrs watched</span>
                    </div>
                  </div>
                  <svg className="w-4 h-4 text-gray-300 group-hover:text-gray-500 shrink-0 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              </div>
            )}

            <DemographicsPanel data={data} />
          </div>
        )}
      </div>
    </>
  );
}
