"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface CreatorSummary {
  mondayId: string;
  talentName: string;
  totalDeals: number;
  totalRevenue: number;
  avgDealSize: number;
  activeDeals: number;
  latestStage: string;
}

interface SalesOverview {
  totalDeals: number;
  totalRevenue: number;
  avgDealSize: number;
  tgsRevenue: number;
  activeCount: number;
  creatorSummaries: CreatorSummary[];
}

function fmt(n: number) {
  if (n >= 1_000_000) return `£${(n / 1_000_000).toFixed(1)}m`;
  if (n >= 1_000) return `£${(n / 1_000).toFixed(1)}k`;
  return `£${n.toLocaleString()}`;
}

const STAGE_COLOR: Record<string, string> = {
  "Won": "bg-emerald-100 text-emerald-700",
  "Campaign Complete": "bg-blue-100 text-blue-700",
  "New Lead": "bg-gray-100 text-gray-500",
  "Proposal Sent": "bg-yellow-100 text-yellow-700",
  "Negotiating": "bg-orange-100 text-orange-700",
  "Lost": "bg-red-100 text-red-500",
  "Cancelled": "bg-gray-100 text-gray-400",
};

function stageColor(stage: string) {
  return STAGE_COLOR[stage] ?? "bg-gray-100 text-gray-500";
}

interface Props {
  // Map from normalised Monday talent name → creator ID (for deep-link)
  creatorIdMap: Record<string, string>;
}

export default function SalesSection({ creatorIdMap }: Props) {
  const [data, setData] = useState<SalesOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/monday/analytics")
      .then((r) => r.json())
      .then((d) => {
        if (d.error) setError(d.error);
        else setData(d);
      })
      .catch(() => setError("Failed to load"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <section className="mt-10">
      <SectionHeader />
      <div className="grid grid-cols-4 gap-3 mb-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white rounded-xl border border-gray-100 p-4 h-24 animate-pulse" />
        ))}
      </div>
    </section>
  );

  if (error) return (
    <section className="mt-10">
      <SectionHeader />
      <p className="text-xs text-red-400 mt-2">
        {error.includes("MONDAY_API_TOKEN")
          ? "Add MONDAY_API_TOKEN to Vercel environment variables to enable this section."
          : `Error: ${error}`}
      </p>
    </section>
  );

  if (!data) return null;

  // Find creator ID from our roster by fuzzy-matching the talent name
  function creatorLink(talentName: string): string | null {
    const norm = talentName.toLowerCase().replace(/[^a-z0-9]/g, "");
    for (const [key, id] of Object.entries(creatorIdMap)) {
      const k = key.toLowerCase().replace(/[^a-z0-9]/g, "");
      if (k.includes(norm) || norm.includes(k)) return `/creator/${id}/revenue`;
    }
    return null;
  }

  return (
    <section className="mt-10">
      <SectionHeader />

      {/* 4 summary widgets */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <StatWidget label="Deals Closed" value={String(data.totalDeals)} sub="all time" icon="🤝" />
        <StatWidget label="Total Revenue" value={fmt(data.totalRevenue)} sub="creator earnings" icon="💰" />
        <StatWidget label="Avg Deal Size" value={fmt(data.avgDealSize)} sub="per deal" icon="📊" />
        <StatWidget label="TGS Commission" value={fmt(data.tgsRevenue)} sub="20% of revenue" icon="🏢" />
      </div>

      {/* Creator deal cards */}
      {data.creatorSummaries.length === 0 ? (
        <p className="text-xs text-gray-400">No deal data found in Monday.</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {data.creatorSummaries.map((c) => {
            const link = creatorLink(c.talentName);
            const card = (
              <div className="bg-white rounded-xl border border-gray-100 p-4 hover:border-gray-200 hover:shadow-sm transition-all cursor-pointer group">
                <p className="text-[11px] font-medium text-gray-800 truncate mb-2 group-hover:text-gray-900">
                  {c.talentName}
                </p>
                <p className="text-lg font-semibold text-gray-900 tabular-nums">{fmt(c.avgDealSize)}</p>
                <p className="text-[10px] text-gray-400 mb-3">avg deal size · {c.totalDeals} deal{c.totalDeals !== 1 ? "s" : ""} won</p>
                <div className="flex items-center justify-between">
                  <span className={`text-[9px] font-medium px-1.5 py-0.5 rounded-full ${stageColor(c.latestStage)}`}>
                    {c.latestStage}
                  </span>
                  {c.activeDeals > 0 && (
                    <span className="text-[9px] text-gray-400">{c.activeDeals} active</span>
                  )}
                </div>
              </div>
            );
            return link ? (
              <Link key={c.mondayId} href={link}>{card}</Link>
            ) : (
              <div key={c.mondayId}>{card}</div>
            );
          })}
        </div>
      )}
    </section>
  );
}

function SectionHeader() {
  return (
    <div className="flex items-center justify-between mb-4">
      <div>
        <h2 className="text-sm font-semibold text-gray-800">Revenue Analytics</h2>
        <p className="text-[11px] text-gray-400 mt-0.5">Deal data from Monday.com Opportunities</p>
      </div>
      <span className="text-[10px] font-medium text-gray-400 bg-gray-50 border border-gray-100 rounded-full px-2.5 py-1">
        Live from Monday
      </span>
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
