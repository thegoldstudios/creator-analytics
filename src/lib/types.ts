export type Platform = "tiktok" | "instagram" | "youtube_shorts" | "youtube_longform";
export type Agent = "Maddie" | "Elicia" | "Olivia" | "Seth" | "Kelvin" | "Emerson";

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
  avatar: string;      // initials fallback
  photoUrl?: string;   // profile picture URL
  category: string;
  agent: Agent;
  platforms: Platform[];
  analytics: Partial<Record<Platform, PlatformAnalytics>>;
  shareToken: string;
  youtubeHandle?: string; // e.g. "niallnochill" — used to fetch live YouTube stats
}
