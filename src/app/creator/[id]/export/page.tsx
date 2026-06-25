import { notFound } from "next/navigation";
import Image from "next/image";
import { getAllCreators } from "@/lib/creators-store";
import { formatNum, PLATFORM_LABELS } from "@/lib/mock-data";
import { Platform, PlatformAnalytics } from "@/lib/types";
import ExportTrigger from "@/components/ExportTrigger";

const PLATFORM_BG: Record<Platform, string> = {
  tiktok: "bg-gray-900 text-white",
  instagram: "bg-gradient-to-r from-purple-600 to-pink-500 text-white",
  youtube_shorts: "bg-red-500 text-white",
  youtube_longform: "bg-red-700 text-white",
};

function StatBlock({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
      <p className="text-[9px] font-semibold uppercase tracking-widest text-gray-400 mb-1">{label}</p>
      <p className="text-[22px] font-bold text-gray-900 leading-none">{value}</p>
      {sub && <p className="text-[11px] mt-1.5 font-semibold" style={{ color: "#3ddc6e" }}>{sub}</p>}
    </div>
  );
}

function PlatformSection({ platform, data }: { platform: Platform; data: PlatformAnalytics }) {
  const topCountry = data.topCountries[0];
  return (
    <div className="mb-8 break-inside-avoid">
      <div className="flex items-center gap-2 mb-3">
        <span className={`text-[11px] font-bold px-3 py-1 rounded-full tracking-wide ${PLATFORM_BG[platform]}`}>
          {PLATFORM_LABELS[platform]}
        </span>
        <span className="text-[13px] text-gray-400">{formatNum(data.followers)} followers</span>
      </div>
      <div className="grid grid-cols-4 gap-2 mb-2">
        <StatBlock label="Engagement" value={`${data.engagementRate}%`} />
        <StatBlock label="Avg Views" value={formatNum(data.avgViews)} />
        <StatBlock label="Avg Likes" value={formatNum(data.avgLikes)} />
        <StatBlock label="Avg Comments" value={data.avgComments.toString()} />
      </div>
      <div className="grid grid-cols-3 gap-2">
        <StatBlock label="Total Videos" value={data.totalVideos.toString()} />
        <StatBlock label="Total Impressions" value={formatNum(data.totalImpressions)} />
        <StatBlock label="Top Country" value={topCountry ? `${topCountry.flag} ${topCountry.pct}%` : "—"} sub={topCountry?.country} />
      </div>
    </div>
  );
}

export default async function ExportPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const all = await getAllCreators();
  const creator = all.find((c) => c.id === id);
  if (!creator) notFound();

  const today = new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });

  return (
    <div className="bg-white min-h-screen">
      <ExportTrigger />

      <div className="max-w-3xl mx-auto px-8 py-10">
        {/* Header */}
        <div className="flex items-start justify-between mb-8 pb-6 border-b border-gray-100">
          <div className="flex items-center gap-4">
            {creator.photoUrl ? (
              <div className="w-16 h-16 rounded-2xl overflow-hidden relative shrink-0">
                <Image src={creator.photoUrl} alt={creator.name} fill className="object-cover" unoptimized />
              </div>
            ) : (
              <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center text-lg font-semibold text-gray-600 shrink-0">
                {creator.avatar}
              </div>
            )}
            <div>
              <h1 className="text-[26px] font-bold text-gray-900 tracking-tight">{creator.name}</h1>
              <p className="text-[13px] text-gray-400 mt-0.5">{creator.handle} · {creator.category}</p>
            </div>
          </div>
          <div className="text-right shrink-0">
            <Image src="/tgs-logo.png" alt="The Gold Studios" width={36} height={36} className="object-contain ml-auto mb-1" />
            <p className="text-[11px] text-gray-400 font-medium">The Gold Studios</p>
            <p className="text-[11px] text-gray-300">{today}</p>
          </div>
        </div>

        {/* Platforms */}
        {creator.platforms.map((p) => {
          const data = creator.analytics[p];
          if (!data) return null;
          return <PlatformSection key={p} platform={p} data={data} />;
        })}

        {/* Footer */}
        <div className="mt-10 pt-5 border-t border-gray-100 flex items-center justify-between">
          <p className="text-[11px] text-gray-300">Prepared by The Gold Studios · thegoldstudios.com</p>
          <p className="text-[11px] text-gray-300">Confidential — for brand use only</p>
        </div>
      </div>
    </div>
  );
}
