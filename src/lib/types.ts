export type Platform = "tiktok" | "instagram" | "youtube_shorts" | "youtube_longform";

export interface DemographicBar {
  label: string;
  value: number;
}

export interface PlatformAnalytics {
  platform: Platform;
  followers: number;
  followersGrowthPct: number; // last 30 days
  engagementRate: number;
  followerEngagementRate: number;
  totalVideos: number;
  totalImpressions: number;
  totalEngagements: number;
  avgViews: number;
  avgLikes: number;
  avgComments: number;
  gender: { male: number; female: number };
  ageGender: {
    all: DemographicBar[];
    male: DemographicBar[];
    female: DemographicBar[];
  };
  topCountries: { country: string; flag: string; pct: number }[];
}

export interface Creator {
  id: string;
  name: string;
  handle: string;
  avatar: string;
  category: string;
  platforms: Platform[];
  analytics: Partial<Record<Platform, PlatformAnalytics>>;
  shareToken: string;
}
