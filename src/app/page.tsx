import Link from "next/link";
import { CREATORS, formatNum } from "@/lib/mock-data";
import { Platform } from "@/lib/types";
import TopNav from "@/components/TopNav";

const PLATFORM_PILL: Record<Platform, string> = {
  tiktok: "bg-gray-900 text-white",
  instagram: "bg-pink-500 text-white",
  youtube_shorts: "bg-red-500 text-white",
  youtube_longform: "bg-red-700 text-white",
};

const PLATFORM_LABEL: Record<Platform, string> = {
  tiktok: "TikTok",
  instagram: "Instagram",
  youtube_shorts: "YT Shorts",
  youtube_longform: "YouTube",
};

export default function RosterPage() {
  return (
    <>
      <TopNav />
      <div className="max-w-6xl mx-auto px-6 py-10">
        <div className="mb-8">
          <h1 className="text-[22px] font-semibold text-gray-900 tracking-tight">Talent Roster</h1>
          <p className="text-sm text-gray-400 mt-1">{CREATORS.length} creators managed by Maddie Warn</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {CREATORS.map((creator) => {
            const firstPlatform = creator.platforms[0];
            const data = creator.analytics[firstPlatform];
            return (
              <Link
                key={creator.id}
                href={`/creator/${creator.id}`}
                className="group bg-white rounded-2xl p-5 border border-gray-100 hover:border-gray-200 hover:shadow-md transition-all duration-200 block"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-gray-100 text-gray-700 flex items-center justify-center text-xs font-semibold shrink-0">
                    {creator.avatar}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-[14px] text-gray-900 leading-tight truncate">{creator.name}</p>
                    <p className="text-[12px] text-gray-400 truncate mt-0.5">{creator.handle}</p>
                  </div>
                  <span className="text-[10px] text-gray-400 bg-gray-50 border border-gray-100 px-2 py-0.5 rounded-full shrink-0 font-medium">
                    {creator.category}
                  </span>
                </div>

                <div className="flex flex-wrap gap-1 mb-4">
                  {creator.platforms.map((p) => (
                    <span key={p} className={`text-[9px] font-semibold px-2 py-0.5 rounded-full tracking-wide ${PLATFORM_PILL[p]}`}>
                      {PLATFORM_LABEL[p]}
                    </span>
                  ))}
                </div>

                {data && (
                  <div className="grid grid-cols-3 gap-3 pt-3.5 border-t border-gray-50">
                    <div>
                      <p className="text-[9px] text-gray-400 uppercase tracking-widest mb-1">Followers</p>
                      <p className="text-[15px] font-semibold text-gray-900">{formatNum(data.followers)}</p>
                    </div>
                    <div>
                      <p className="text-[9px] text-gray-400 uppercase tracking-widest mb-1">Engagement</p>
                      <p className="text-[15px] font-semibold text-gray-900">{data.engagementRate}%</p>
                    </div>
                    <div>
                      <p className="text-[9px] text-gray-400 uppercase tracking-widest mb-1">Avg Views</p>
                      <p className="text-[15px] font-semibold text-gray-900">{formatNum(data.avgViews)}</p>
                    </div>
                  </div>
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </>
  );
}
