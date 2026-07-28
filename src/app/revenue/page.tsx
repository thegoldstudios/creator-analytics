import Link from "next/link";
import Image from "next/image";
import Footer from "@/components/Footer";
import { fetchAllDeals, isWon, isActive, fmt, MondayDeal } from "@/lib/monday";
import { getAllCreators } from "@/lib/creators-store";

function norm(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]/g, "");
}

function matchCreatorId(talentName: string, creatorMap: Record<string, string>): string | null {
  const n = norm(talentName);
  for (const [name, id] of Object.entries(creatorMap)) {
    const k = norm(name);
    if (k.includes(n) || n.includes(k)) return id;
  }
  return null;
}

const STAGE_COLOR: Record<string, string> = {
  Won: "bg-emerald-100 text-emerald-700",
  "Campaign Complete": "bg-blue-100 text-blue-700",
  "New Lead": "bg-gray-100 text-gray-500",
  "Proposal Sent": "bg-yellow-100 text-yellow-700",
  Negotiating: "bg-orange-100 text-orange-700",
  Lost: "bg-red-100 text-red-500",
  Cancelled: "bg-gray-100 text-gray-400",
};

function stageColor(s: string) {
  return STAGE_COLOR[s] ?? "bg-gray-100 text-gray-500";
}

interface CreatorSummary {
  talentProfileId: string;
  talentName: string;
  totalDeals: number;
  totalRevenue: number;
  avgDealSize: number;
  tgsRevenue: number;
  activeDeals: number;
  latestStage: string;
  creatorId: string | null; // matched platform creator id
}

export default async function RevenuePage() {
  let deals: MondayDeal[] = [];
  let error: string | null = null;

  try {
    deals = await fetchAllDeals();
  } catch (e) {
    error = e instanceof Error ? e.message : "Failed to load";
  }

  const creators = await getAllCreators();
  const creatorMap = Object.fromEntries(creators.map((c) => [c.name, c.id]));

  // Aggregate by talent profile
  const byTalent: Record<string, CreatorSummary> = {};
  for (const deal of deals) {
    const key = deal.talentProfileId ?? deal.talentName ?? "";
    if (!key) continue;
    if (!byTalent[key]) {
      byTalent[key] = {
        talentProfileId: key,
        talentName: deal.talentName ?? "Unknown",
        totalDeals: 0,
        totalRevenue: 0,
        avgDealSize: 0,
        tgsRevenue: 0,
        activeDeals: 0,
        latestStage: deal.stage,
        creatorId: deal.talentName ? matchCreatorId(deal.talentName, creatorMap) : null,
      };
    }
    if (isWon(deal)) {
      byTalent[key].totalDeals++;
      byTalent[key].totalRevenue += deal.dealValue;
      byTalent[key].tgsRevenue += deal.tgsCut;
    }
    if (isActive(deal)) {
      byTalent[key].activeDeals++;
      byTalent[key].latestStage = deal.stage;
    }
  }

  const summaries = Object.values(byTalent)
    .map((s) => ({ ...s, avgDealSize: s.totalDeals > 0 ? Math.round(s.totalRevenue / s.totalDeals) : 0 }))
    .sort((a, b) => b.totalRevenue - a.totalRevenue);

  const wonDeals = deals.filter(isWon);
  const totalRevenue = wonDeals.reduce((s, d) => s + d.dealValue, 0);
  const totalDeals = wonDeals.length;
  const avgDealSize = totalDeals > 0 ? Math.round(totalRevenue / totalDeals) : 0;
  const tgsRevenue = wonDeals.reduce((s, d) => s + d.tgsCut, 0);
  const activeCount = deals.filter(isActive).length;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white/90 backdrop-blur border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center gap-4">
          <Image src="/tgs-logo.png" alt="The Gold Studios" width={28} height={28} className="object-contain shrink-0" />
          <span className="text-[13px] font-semibold text-gray-700 tracking-tight hidden sm:block">The Gold Studios</span>
          <span className="text-gray-200 hidden sm:block">|</span>

          {/* Section tabs */}
          <nav className="flex items-center gap-1">
            <Link
              href="/"
              className="px-3 py-1.5 rounded-lg text-[13px] font-medium text-gray-400 hover:text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Analytics
            </Link>
            <Link
              href="/revenue"
              className="px-3 py-1.5 rounded-lg text-[13px] font-medium bg-gray-900 text-white"
            >
              Revenue
            </Link>
          </nav>

          <div className="ml-auto flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#3ddc6e] animate-pulse" />
            <span className="text-[11px] text-gray-400 font-medium hidden sm:block">Live · Monday.com</span>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-6xl mx-auto w-full px-6 py-8">
        <div className="mb-7">
          <h1 className="text-[15px] font-semibold text-gray-800">Revenue Analytics</h1>
          <p className="text-[12px] text-gray-400 mt-0.5">Deal data live from Monday.com Opportunities board</p>
        </div>

        {error ? (
          <div className="bg-red-50 border border-red-100 rounded-xl p-4 text-xs text-red-500 mb-6">
            {error.includes("MONDAY_API_TOKEN")
              ? "Add MONDAY_API_TOKEN to Vercel environment variables to enable this page."
              : `Error: ${error}`}
          </div>
        ) : (
          <>
            {/* 4 summary stat widgets */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-7">
              <StatWidget label="Deals Closed" value={String(totalDeals)} sub="all time" icon="🤝" />
              <StatWidget label="Total Revenue" value={fmt(totalRevenue)} sub="creator earnings" icon="💰" />
              <StatWidget label="Avg Deal Size" value={fmt(avgDealSize)} sub="per deal" icon="📊" />
              <StatWidget label="TGS Commission" value={fmt(tgsRevenue)} sub={`${activeCount} active leads`} icon="🏢" />
            </div>

            {/* Creator deal cards */}
            {summaries.length === 0 ? (
              <p className="text-xs text-gray-400">No deal data found in Monday.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {summaries.map((s) => {
                  const href = s.creatorId ? `/creator/${s.creatorId}/revenue` : null;
                  const card = (
                    <div className="bg-white rounded-2xl border border-gray-100 p-5 hover:border-gray-200 hover:shadow-sm transition-all group">
                      {/* Header row */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="min-w-0">
                          <p className="text-[13px] font-semibold text-gray-900 truncate group-hover:text-black">
                            {s.talentName}
                          </p>
                          <span className={`inline-block mt-1 text-[9px] font-medium px-1.5 py-0.5 rounded-full ${stageColor(s.latestStage)}`}>
                            {s.latestStage}
                          </span>
                        </div>
                        {href && (
                          <svg className="w-4 h-4 text-gray-200 group-hover:text-gray-400 shrink-0 mt-0.5 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                          </svg>
                        )}
                      </div>

                      {/* Stats grid */}
                      <div className="grid grid-cols-2 gap-x-4 gap-y-3 pt-3.5 border-t border-gray-50">
                        <div>
                          <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-0.5">Avg Deal</p>
                          <p className="text-[15px] font-semibold text-gray-900 tabular-nums">{fmt(s.avgDealSize)}</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-0.5">Revenue</p>
                          <p className="text-[15px] font-semibold text-gray-900 tabular-nums">{fmt(s.totalRevenue)}</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-0.5">Deals Won</p>
                          <p className="text-[15px] font-semibold text-gray-900 tabular-nums">{s.totalDeals}</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-0.5">TGS Cut</p>
                          <p className="text-[15px] font-semibold text-gray-900 tabular-nums">{fmt(s.tgsRevenue)}</p>
                        </div>
                      </div>

                      {s.activeDeals > 0 && (
                        <p className="text-[10px] text-gray-400 mt-3 pt-3 border-t border-gray-50">
                          {s.activeDeals} active lead{s.activeDeals !== 1 ? "s" : ""} in pipeline
                        </p>
                      )}
                    </div>
                  );

                  return href ? (
                    <Link key={s.talentProfileId} href={href}>{card}</Link>
                  ) : (
                    <div key={s.talentProfileId}>{card}</div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}

function StatWidget({ label, value, sub, icon }: { label: string; value: string; sub: string; icon: string }) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-4">
      <div className="flex items-center justify-between mb-1">
        <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wide">{label}</p>
        <span className="text-sm">{icon}</span>
      </div>
      <p className="text-xl font-semibold text-gray-900 tabular-nums">{value}</p>
      <p className="text-[10px] text-gray-400 mt-0.5">{sub}</p>
    </div>
  );
}
