import { Agent, Creator, Platform, PlatformAnalytics } from "./types";

const DEFAULT_AGE_GENDER = {
  all: [
    { label: "18-24", value: 31.2 },
    { label: "25-34", value: 43.8 },
    { label: "35-44", value: 14.6 },
    { label: "45-54", value: 6.8 },
    { label: "55-64", value: 3.6 },
  ],
  male: [
    { label: "18-24", value: 36.1 },
    { label: "25-34", value: 39.4 },
    { label: "35-44", value: 15.2 },
    { label: "45-54", value: 6.5 },
    { label: "55-64", value: 2.8 },
  ],
  female: [
    { label: "18-24", value: 27.4 },
    { label: "25-34", value: 47.5 },
    { label: "35-44", value: 14.1 },
    { label: "45-54", value: 7.1 },
    { label: "55-64", value: 3.9 },
  ],
};

const UK_COUNTRIES = [
  { country: "United Kingdom", flag: "🇬🇧", pct: 52.4 },
  { country: "United States", flag: "🇺🇸", pct: 18.6 },
  { country: "Ireland", flag: "🇮🇪", pct: 9.2 },
  { country: "Australia", flag: "🇦🇺", pct: 7.8 },
  { country: "Canada", flag: "🇨🇦", pct: 4.1 },
];

function platform(
  p: Platform,
  followers: number,
  opts: { growth?: number; engRate?: number; videos?: number; gender?: { male: number; female: number } }
): PlatformAnalytics {
  const engRate = opts.engRate ?? 5.8;
  const growth = opts.growth ?? 4.2;
  const gender = opts.gender ?? { male: 38, female: 62 };
  const avgViews = Math.round(followers * (p === "tiktok" ? 0.42 : p === "instagram" ? 0.14 : 0.22));
  const avgLikes = Math.round(avgViews * (engRate / 100) * 0.85);
  const avgComments = Math.round(avgViews * 0.004);
  const videos = opts.videos ?? 120;
  return {
    platform: p,
    followers,
    followersGrowthPct: growth,
    engagementRate: engRate,
    followerEngagementRate: parseFloat((engRate * 0.58).toFixed(2)),
    totalVideos: videos,
    totalImpressions: Math.round(avgViews * videos * 1.4),
    totalEngagements: Math.round(avgLikes * videos),
    avgViews,
    avgLikes,
    avgComments,
    gender,
    ageGender: DEFAULT_AGE_GENDER,
    topCountries: UK_COUNTRIES,
  };
}

function initials(name: string): string {
  const parts = name.replace(/[|].*/g, "").trim().split(" ");
  return parts.length >= 2
    ? (parts[0][0] + parts[1][0]).toUpperCase()
    : parts[0].substring(0, 2).toUpperCase();
}

function slug(name: string): string {
  return "share_" + name.toLowerCase().replace(/[^a-z0-9]/g, "_").substring(0, 20);
}

// unavatar.io fetches profile pictures from social platforms by username
function igPhoto(username: string): string {
  return `https://unavatar.io/instagram/${username.replace(/^@/, "")}`;
}
function ttPhoto(username: string): string {
  return `https://unavatar.io/tiktok/${username.replace(/^@/, "")}`;
}

export const CREATORS: Creator[] = [
  {
    id: "1",
    name: "Phoebe Is Ginger",
    handle: "@phoebeisginger1",
    avatar: initials("Phoebe Ginger"),
    photoUrl: igPhoto("phoebeisginger1"),
    category: "Lifestyle",
    agent: "Maddie" as Agent,
    platforms: ["tiktok", "instagram", "youtube_shorts"],
    analytics: {
      tiktok: platform("tiktok", 1_300_000, { growth: 6.2, engRate: 7.1, videos: 340, gender: { male: 32, female: 68 } }),
      instagram: platform("instagram", 994_000, { growth: 4.8, engRate: 4.2, videos: 180, gender: { male: 30, female: 70 } }),
      youtube_shorts: platform("youtube_shorts", 78_100, { growth: 9.1, engRate: 5.5, videos: 95, gender: { male: 29, female: 71 } }),
    },
    shareToken: slug("phoebe_is_ginger"),
  },
  {
    id: "2",
    name: "TA TECH Tips",
    handle: "@tatechtips",
    avatar: initials("TA TECH"),
    photoUrl: igPhoto("tatechtips"),
    category: "Tech",
    agent: "Maddie" as Agent,
    platforms: ["tiktok", "instagram", "youtube_shorts"],
    analytics: {
      tiktok: platform("tiktok", 3_400_000, { growth: 5.4, engRate: 6.8, videos: 420, gender: { male: 72, female: 28 } }),
      instagram: platform("instagram", 392_000, { growth: 3.2, engRate: 3.1, videos: 210, gender: { male: 70, female: 30 } }),
      youtube_shorts: platform("youtube_shorts", 34_200, { growth: 11.2, engRate: 5.9, videos: 130, gender: { male: 73, female: 27 } }),
    },
    shareToken: slug("ta_tech_tips"),
  },
  {
    id: "3",
    name: "Jack Knightly",
    handle: "@jackknightley",
    avatar: initials("Jack Knightly"),
    photoUrl: igPhoto("jackknightley"),
    category: "Comedy",
    agent: "Maddie" as Agent,
    platforms: ["tiktok", "instagram", "youtube_shorts"],
    analytics: {
      tiktok: platform("tiktok", 1_700_000, { growth: 7.8, engRate: 8.2, videos: 280, gender: { male: 44, female: 56 } }),
      instagram: platform("instagram", 188_000, { growth: 5.1, engRate: 4.6, videos: 140, gender: { male: 42, female: 58 } }),
      youtube_shorts: platform("youtube_shorts", 6_610, { growth: 14.3, engRate: 6.1, videos: 60, gender: { male: 43, female: 57 } }),
    },
    shareToken: slug("jack_knightly"),
  },
  {
    id: "4",
    name: "Eleanor Wilkes",
    handle: "@_eleanorwilkes_",
    avatar: initials("Eleanor Wilkes"),
    photoUrl: igPhoto("_eleanorwilkes_"),
    category: "Fashion",
    agent: "Maddie" as Agent,
    platforms: ["tiktok", "instagram", "youtube_shorts"],
    analytics: {
      tiktok: platform("tiktok", 988_600, { growth: 6.9, engRate: 7.4, videos: 310, gender: { male: 21, female: 79 } }),
      instagram: platform("instagram", 30_400, { growth: 4.2, engRate: 3.8, videos: 95, gender: { male: 20, female: 80 } }),
      youtube_shorts: platform("youtube_shorts", 43_000, { growth: 8.5, engRate: 5.2, videos: 80, gender: { male: 22, female: 78 } }),
    },
    shareToken: slug("eleanor_wilkes"),
  },
  {
    id: "5",
    name: "Daragh Twomey",
    handle: "@daragh2me",
    avatar: initials("Daragh Twomey"),
    photoUrl: ttPhoto("daragh2me"),
    category: "Sketch Comedy",
    agent: "Maddie" as Agent,
    platforms: ["tiktok", "instagram", "youtube_shorts"],
    analytics: {
      tiktok: platform("tiktok", 640_300, { growth: 5.6, engRate: 7.8, videos: 260, gender: { male: 48, female: 52 } }),
      instagram: platform("instagram", 49_300, { growth: 3.4, engRate: 4.1, videos: 110, gender: { male: 46, female: 54 } }),
      youtube_shorts: platform("youtube_shorts", 5_840, { growth: 12.1, engRate: 6.3, videos: 55, gender: { male: 47, female: 53 } }),
    },
    shareToken: slug("daragh_twomey"),
  },
  {
    id: "6",
    name: "Toby Stubbs",
    handle: "@toby_stubbs",
    avatar: initials("Toby Stubbs"),
    photoUrl: igPhoto("toby_stubbs"),
    category: "Acting",
    agent: "Maddie" as Agent,
    platforms: ["tiktok", "instagram", "youtube_shorts", "youtube_longform"],
    analytics: {
      tiktok: platform("tiktok", 291_700, { growth: 4.8, engRate: 6.9, videos: 190, gender: { male: 41, female: 59 } }),
      instagram: platform("instagram", 23_900, { growth: 3.1, engRate: 3.5, videos: 80, gender: { male: 40, female: 60 } }),
      youtube_shorts: platform("youtube_shorts", 1_120_000, { growth: 18.4, engRate: 7.2, videos: 120, gender: { male: 39, female: 61 } }),
      youtube_longform: platform("youtube_longform", 1_120_000, { growth: 18.4, engRate: 5.8, videos: 85, gender: { male: 39, female: 61 } }),
    },
    shareToken: slug("toby_stubbs"),
  },
  {
    id: "7",
    name: "Vicer Versa | Tian",
    handle: "@vicerversa",
    avatar: initials("Vicer Versa"),
    photoUrl: igPhoto("vicerversa"),
    category: "Street Interview",
    agent: "Maddie" as Agent,
    platforms: ["tiktok", "instagram"],
    analytics: {
      tiktok: platform("tiktok", 363_600, { growth: 21.4, engRate: 8.9, videos: 145, gender: { male: 55, female: 45 } }),
      instagram: platform("instagram", 36_400, { growth: 14.2, engRate: 5.1, videos: 60, gender: { male: 53, female: 47 } }),
    },
    shareToken: slug("vicer_versa"),
  },
  {
    id: "8",
    name: "dad.jokes.lco | Adam",
    handle: "@dad.jokes.lco",
    avatar: initials("dad jokes"),
    photoUrl: ttPhoto("dad.jokes.lco"),
    category: "Comedy",
    agent: "Maddie" as Agent,
    platforms: ["tiktok", "instagram"],
    analytics: {
      tiktok: platform("tiktok", 345_700, { growth: 8.3, engRate: 9.1, videos: 230, gender: { male: 49, female: 51 } }),
      instagram: platform("instagram", 30_300, { growth: 5.6, engRate: 4.3, videos: 100, gender: { male: 48, female: 52 } }),
    },
    shareToken: slug("dad_jokes_lco"),
  },
  {
    id: "9",
    name: "Natasha | mybraindumpingground",
    handle: "@mybraindumpingground",
    avatar: initials("Natasha M"),
    photoUrl: igPhoto("mybraindumpingground"),
    category: "Sketch Comedy",
    agent: "Maddie" as Agent,
    platforms: ["tiktok", "instagram"],
    analytics: {
      tiktok: platform("tiktok", 210_700, { growth: 5.9, engRate: 7.3, videos: 200, gender: { male: 26, female: 74 } }),
      instagram: platform("instagram", 14_200, { growth: 4.1, engRate: 3.9, videos: 85, gender: { male: 25, female: 75 } }),
    },
    shareToken: slug("natasha_braindump"),
  },
  {
    id: "10",
    name: "Northern Funny Mummy | Kayleigh",
    handle: "@northernfunnymummy",
    avatar: initials("Northern Funny"),
    photoUrl: igPhoto("northernfunnymummy"),
    category: "Sketch Comedy",
    agent: "Maddie" as Agent,
    platforms: ["tiktok", "instagram"],
    analytics: {
      tiktok: platform("tiktok", 197_900, { growth: 6.7, engRate: 8.4, videos: 250, gender: { male: 22, female: 78 } }),
      instagram: platform("instagram", 73_000, { growth: 4.9, engRate: 4.7, videos: 120, gender: { male: 21, female: 79 } }),
    },
    shareToken: slug("northern_funny_mummy"),
  },
  {
    id: "11",
    name: "Jasper Pagan",
    handle: "@jasper_pagan",
    avatar: initials("Jasper Pagan"),
    photoUrl: igPhoto("jasper_pagan"),
    category: "Lifestyle",
    agent: "Maddie" as Agent,
    platforms: ["tiktok", "instagram", "youtube_shorts"],
    analytics: {
      tiktok: platform("tiktok", 188_100, { growth: 5.1, engRate: 6.8, videos: 175, gender: { male: 35, female: 65 } }),
      instagram: platform("instagram", 50_900, { growth: 3.8, engRate: 4.1, videos: 90, gender: { male: 34, female: 66 } }),
      youtube_shorts: platform("youtube_shorts", 10_400, { growth: 9.7, engRate: 5.4, videos: 50, gender: { male: 35, female: 65 } }),
    },
    shareToken: slug("jasper_pagan"),
  },
  {
    id: "12",
    name: "Henry da Peng",
    handle: "@henrydapeng1",
    avatar: initials("Henry Peng"),
    photoUrl: igPhoto("henrydapeng1"),
    category: "Comedy",
    agent: "Maddie" as Agent,
    platforms: ["tiktok", "instagram"],
    analytics: {
      tiktok: platform("tiktok", 124_100, { growth: 16.8, engRate: 9.2, videos: 130, gender: { male: 50, female: 50 } }),
      instagram: platform("instagram", 35_900, { growth: 11.4, engRate: 5.3, videos: 55, gender: { male: 49, female: 51 } }),
    },
    shareToken: slug("henry_da_peng"),
  },
  {
    id: "13",
    name: "Redbusruss | Russell",
    handle: "@redbusruss",
    avatar: initials("Redbusruss R"),
    photoUrl: igPhoto("redbusruss"),
    category: "Opinions",
    agent: "Maddie" as Agent,
    platforms: ["tiktok", "instagram", "youtube_longform"],
    analytics: {
      tiktok: platform("tiktok", 137_900, { growth: 4.3, engRate: 6.1, videos: 190, gender: { male: 58, female: 42 } }),
      instagram: platform("instagram", 94_500, { growth: 3.2, engRate: 3.4, videos: 90, gender: { male: 57, female: 43 } }),
      youtube_longform: platform("youtube_longform", 35_500, { growth: 6.9, engRate: 5.1, videos: 65, gender: { male: 59, female: 41 } }),
    },
    shareToken: slug("redbusruss"),
  },
  {
    id: "14",
    name: "Joe Foster",
    handle: "@joeefoster",
    avatar: initials("Joe Foster"),
    photoUrl: igPhoto("joeefoster"),
    category: "LGBTQ+",
    agent: "Maddie" as Agent,
    platforms: ["tiktok", "instagram"],
    analytics: {
      tiktok: platform("tiktok", 82_500, { growth: 5.2, engRate: 7.2, videos: 160, gender: { male: 45, female: 55 } }),
      instagram: platform("instagram", 10_200, { growth: 3.9, engRate: 4.4, videos: 70, gender: { male: 44, female: 56 } }),
    },
    shareToken: slug("joe_foster"),
  },
  {
    id: "15",
    name: "Harry Oliver",
    handle: "@harryoliver_29",
    avatar: initials("Harry Oliver"),
    photoUrl: ttPhoto("harryoliver_29"),
    category: "Gen Z",
    agent: "Maddie" as Agent,
    platforms: ["tiktok", "instagram"],
    analytics: {
      tiktok: platform("tiktok", 49_100, { growth: 7.4, engRate: 8.6, videos: 140, gender: { male: 38, female: 62 } }),
      instagram: platform("instagram", 3_176, { growth: 5.1, engRate: 5.2, videos: 50, gender: { male: 37, female: 63 } }),
    },
    shareToken: slug("harry_oliver"),
  },
  {
    id: "16",
    name: "Just Jay Online | Jay",
    handle: "@justjayonline",
    avatar: initials("Just Jay"),
    photoUrl: igPhoto("justjayonline"),
    category: "Comedy",
    agent: "Maddie" as Agent,
    platforms: ["tiktok", "instagram"],
    analytics: {
      tiktok: platform("tiktok", 41_900, { growth: 9.1, engRate: 8.8, videos: 110, gender: { male: 47, female: 53 } }),
      instagram: platform("instagram", 15_400, { growth: 6.3, engRate: 5.0, videos: 50, gender: { male: 46, female: 54 } }),
    },
    shareToken: slug("just_jay_online"),
  },
  {
    id: "17",
    name: "Ben.m0v",
    handle: "@ben.m0v",
    avatar: initials("Ben M"),
    photoUrl: ttPhoto("ben.m0v"),
    category: "Gaming & Tech",
    agent: "Maddie" as Agent,
    platforms: ["tiktok", "instagram", "youtube_shorts"],
    analytics: {
      tiktok: platform("tiktok", 65_000, { growth: 4.8, engRate: 6.4, videos: 155, gender: { male: 68, female: 32 } }),
      instagram: platform("instagram", 65_800, { growth: 3.6, engRate: 3.7, videos: 90, gender: { male: 67, female: 33 } }),
      youtube_shorts: platform("youtube_shorts", 15_700, { growth: 8.2, engRate: 5.8, videos: 70, gender: { male: 69, female: 31 } }),
    },
    shareToken: slug("ben_m0v"),
  },
  {
    id: "18",
    name: "Raul Gibson",
    handle: "@raulgibsonyeee",
    avatar: initials("Raul Gibson"),
    photoUrl: igPhoto("raulgibsonyeee"),
    category: "Comedy",
    agent: "Maddie" as Agent,
    platforms: ["tiktok", "instagram"],
    analytics: {
      tiktok: platform("tiktok", 37_200, { growth: 6.1, engRate: 8.1, videos: 95, gender: { male: 52, female: 48 } }),
      instagram: platform("instagram", 23_700, { growth: 4.4, engRate: 4.8, videos: 45, gender: { male: 51, female: 49 } }),
    },
    shareToken: slug("raul_gibson"),
  },
  {
    id: "19",
    name: "Rhys Drakeford-Bennett",
    handle: "@rbfilmsyt",
    avatar: initials("Rhys Drakeford"),
    photoUrl: igPhoto("rbfilmsyt"),
    category: "Sketch Comedy",
    agent: "Maddie" as Agent,
    platforms: ["tiktok", "instagram", "youtube_shorts"],
    analytics: {
      tiktok: platform("tiktok", 18_600, { growth: 7.2, engRate: 7.9, videos: 85, gender: { male: 55, female: 45 } }),
      instagram: platform("instagram", 2_799, { growth: 4.8, engRate: 4.6, videos: 35, gender: { male: 54, female: 46 } }),
      youtube_shorts: platform("youtube_shorts", 19_200, { growth: 11.3, engRate: 6.2, videos: 50, gender: { male: 56, female: 44 } }),
    },
    shareToken: slug("rhys_drakeford"),
  },
  {
    id: "20",
    name: "Angry Geezer | Ben Collins",
    handle: "@angrygeeza",
    avatar: initials("Angry Geezer"),
    photoUrl: ttPhoto("angrygeeza"),
    category: "Sketch Comedy",
    agent: "Maddie" as Agent,
    platforms: ["tiktok", "instagram"],
    analytics: {
      tiktok: platform("tiktok", 28_500, { growth: 5.5, engRate: 7.6, videos: 130, gender: { male: 61, female: 39 } }),
      instagram: platform("instagram", 15_300, { growth: 3.9, engRate: 4.2, videos: 60, gender: { male: 60, female: 40 } }),
    },
    shareToken: slug("angry_geezer"),
  },
  {
    id: "21",
    name: "Dan Lockett",
    handle: "@danielrobertlockett",
    avatar: initials("Dan Lockett"),
    photoUrl: igPhoto("danielrobertlockett"),
    category: "Sketch Comedy",
    agent: "Maddie" as Agent,
    platforms: ["tiktok", "instagram"],
    analytics: {
      tiktok: platform("tiktok", 25_200, { growth: 4.9, engRate: 7.1, videos: 110, gender: { male: 43, female: 57 } }),
      instagram: platform("instagram", 9_586, { growth: 3.6, engRate: 4.0, videos: 50, gender: { male: 42, female: 58 } }),
    },
    shareToken: slug("dan_lockett"),
  },
  {
    id: "22",
    name: "sugargabe | Gabriel",
    handle: "@sugargabe",
    avatar: initials("Sugar Gabe"),
    photoUrl: igPhoto("sugargabe"),
    category: "Comedy Sketches",
    agent: "Maddie" as Agent,
    platforms: ["tiktok", "instagram"],
    analytics: {
      tiktok: platform("tiktok", 18_500, { growth: 8.4, engRate: 8.7, videos: 90, gender: { male: 40, female: 60 } }),
      instagram: platform("instagram", 5_042, { growth: 5.9, engRate: 5.1, videos: 40, gender: { male: 39, female: 61 } }),
    },
    shareToken: slug("sugargabe"),
  },
  {
    id: "23",
    name: "Niall no chill",
    handle: "@niallnochill_",
    avatar: initials("Niall Nochill"),
    photoUrl: igPhoto("niallnochill_"),
    category: "Reviews",
    agent: "Maddie" as Agent,
    platforms: ["tiktok", "instagram", "youtube_longform"],
    analytics: {
      tiktok: platform("tiktok", 15_500, { growth: 3.8, engRate: 6.9, videos: 95, gender: { male: 54, female: 46 } }),
      instagram: platform("instagram", 5_558, { growth: 2.9, engRate: 3.8, videos: 40, gender: { male: 53, female: 47 } }),
      youtube_longform: platform("youtube_longform", 113_000, { growth: 5.2, engRate: 4.8, videos: 75, gender: { male: 55, female: 45 } }),
    },
    shareToken: slug("niall_no_chill"),
  },
  {
    id: "24",
    name: "Just Dylan",
    handle: "@justdylsn",
    avatar: initials("Just Dylan"),
    photoUrl: igPhoto("justdylsn"),
    category: "Comedy",
    agent: "Maddie" as Agent,
    platforms: ["tiktok", "instagram", "youtube_longform"],
    analytics: {
      tiktok: platform("tiktok", 74_600, { growth: 6.4, engRate: 7.8, videos: 150, gender: { male: 46, female: 54 } }),
      instagram: platform("instagram", 21_100, { growth: 4.7, engRate: 4.4, videos: 65, gender: { male: 45, female: 55 } }),
      youtube_longform: platform("youtube_longform", 182_000, { growth: 8.9, engRate: 5.6, videos: 95, gender: { male: 47, female: 53 } }),
    },
    shareToken: slug("just_dylan"),
  },
  {
    id: "25",
    name: "Michael",
    handle: "@mychaellol",
    avatar: "MC",
    photoUrl: ttPhoto("mychaellol"),
    category: "Comedy",
    agent: "Maddie" as Agent,
    platforms: ["tiktok"],
    analytics: {
      tiktok: platform("tiktok", 26_400, { growth: 10.1, engRate: 9.4, videos: 75, gender: { male: 49, female: 51 } }),
    },
    shareToken: slug("michael_mychaellol"),
  },
];

// Alias so both CREATORS and creators work as import names
export const creators = CREATORS;

export function formatNum(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1).replace(/\.0$/, "") + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1).replace(/\.0$/, "") + "k";
  return n.toString();
}

export const PLATFORM_LABELS: Record<string, string> = {
  tiktok: "TikTok",
  instagram: "Instagram",
  youtube_shorts: "YouTube Shorts",
  youtube_longform: "YouTube",
};

export const PLATFORM_COLORS: Record<string, string> = {
  tiktok: "#010101",
  instagram: "#E1306C",
  youtube_shorts: "#FF0000",
  youtube_longform: "#FF0000",
};
