"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import TopNav from "@/components/TopNav";
import Footer from "@/components/Footer";
import { Creator } from "@/lib/types";
import { CreatorDeals, RevenueSlice } from "@/lib/creator-deals";

type Period = "lifetime" | "year" | "quarter" | "month" | "week";

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

const PIE_COLORS = ["#3ddc6e", "#6366f1", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4", "#f97316", "#84cc16"];

function stageColor(stage: string) {
  return STAGE_COLOR[stage] ?? "bg-gray-100 text-gray-500";
}

function chartData(map: Record<string, RevenueSlice>): { label: string; talentCut: number; tgsCut: number }[] {
  return Object.entries(map)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([label, v]) => ({ label, ...v }));
}

// Current period key for "now" — used to filter stat cards to the current real-world period
function currentPeriodKey(period: Exclude<Period, "lifetime">): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = now.getMonth() + 1;
  if (period === "year") return String(y);
  if (period === "month") return `${y}-${String(m).padStart(2, "0")}`;
  if (period === "quarter") return `${y} Q${Math.ceil(m / 3)}`;
  // week
  const startOfYear = new Date(y, 0, 1);
  const week = Math.ceil(((now.getTime() - startOfYear.getTime()) / 86400000 + startOfYear.getDay() + 1) / 7);
  return `${y}-W${String(week).padStart(2, "0")}`;
}

// Map a wonDate string to the period key format used by the API
function dateToKey(dateStr: string, period: Period): string {
  const date = new Date(dateStr);
  const y = date.getFullYear();
  const m = date.getMonth() + 1;
  if (period === "year") return String(y);
  if (period === "month") return `${y}-${String(m).padStart(2, "0")}`;
  if (period === "quarter") return `${y} Q${Math.ceil(m / 3)}`;
  if (period === "week") {
    const startOfYear = new Date(y, 0, 1);
    const week = Math.ceil(((date.getTime() - startOfYear.getTime()) / 86400000 + startOfYear.getDay() + 1) / 7);
    return `${y}-W${String(week).padStart(2, "0")}`;
  }
  return "";
}

// Responsive stacked bar chart — fills full container width
function StackedBarChart({ data }: { data: { label: string; talentCut: number; tgsCut: number }[] }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(700);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => setContainerWidth(entry.contentRect.width));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  if (data.length === 0) return <div className="flex items-center justify-center h-40 text-xs text-gray-300">No data</div>;

  const chartH = 140;
  const minPerBar = 40;
  const svgWidth = Math.max(containerWidth, data.length * minPerBar);
  const gap = svgWidth / data.length;
  const barW = Math.min(48, gap - 8);
  const maxTotal = Math.max(...data.map((d) => d.talentCut + d.tgsCut), 1);

  return (
    <div ref={containerRef} className="w-full overflow-x-auto">
      <svg width={svgWidth} height={chartH + 36} className="block">
        {data.map((d, i) => {
          const total = d.talentCut + d.tgsCut;
          const totalH = (total / maxTotal) * chartH;
          const tgsH = (d.tgsCut / maxTotal) * chartH;
          const talentH = totalH - tgsH;
          const x = i * gap + (gap - barW) / 2;

          return (
            <g key={d.label}>
              <rect x={x} y={chartH - totalH} width={barW} height={talentH} rx={talentH > 0 ? 2 : 0} fill="#3ddc6e" opacity={0.85} />
              <rect x={x} y={chartH - tgsH} width={barW} height={tgsH} rx={tgsH > 4 ? 2 : 0} fill="#6366f1" opacity={0.9} />
              <text x={x + barW / 2} y={chartH + 14} textAnchor="middle" fontSize={9} fill="#9ca3af">
                {d.label.length > 7 ? d.label.slice(-5) : d.label}
              </text>
              {total > 0 && (
                <text x={x + barW / 2} y={chartH - totalH - 4} textAnchor="middle" fontSize={8} fill="#6b7280">
                  {fmt(total)}
                </text>
              )}
            </g>
          );
        })}
        <line x1={0} y1={chartH} x2={svgWidth} y2={chartH} stroke="#f3f4f6" strokeWidth={1} />
      </svg>
    </div>
  );
}

function PieChart({ slices, title }: { slices: { label: string; value: number }[]; title: string }) {
  const total = slices.reduce((s, x) => s + x.value, 0);
  if (total === 0) return (
    <div className="bg-white rounded-xl border border-gray-100 p-5">
      <p className="text-[11px] font-medium text-gray-500 mb-3">{title}</p>
      <div className="flex items-center justify-center h-28 text-xs text-gray-300">No data</div>
    </div>
  );

  const cx = 56, cy = 56, r = 46;
  let angle = -Math.PI / 2;
  const paths: { path: string; color: string; label: string; pct: number }[] = [];

  for (let i = 0; i < slices.length; i++) {
    const pct = slices[i].value / total;
    const sweep = pct * 2 * Math.PI;
    const x1 = cx + r * Math.cos(angle);
    const y1 = cy + r * Math.sin(angle);
    angle += sweep;
    const x2 = cx + r * Math.cos(angle);
    const y2 = cy + r * Math.sin(angle);
    const large = sweep > Math.PI ? 1 : 0;
    paths.push({
      path: `M${cx},${cy} L${x1},${y1} A${r},${r},0,${large},1,${x2},${y2} Z`,
      color: PIE_COLORS[i % PIE_COLORS.length],
      label: slices[i].label,
      pct: Math.round(pct * 100),
    });
  }

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-5">
      <p className="text-[11px] font-medium text-gray-500 mb-3">{title}</p>
      <div className="flex items-center gap-4">
        <svg width={112} height={112} viewBox="0 0 112 112" className="shrink-0">
          {paths.map((p, i) => (
            <path key={i} d={p.path} fill={p.color} stroke="white" strokeWidth={1.5} />
          ))}
        </svg>
        <div className="space-y-1.5 min-w-0">
          {paths.map((p, i) => (
            <div key={i} className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: p.color }} />
              <span className="text-[10px] text-gray-600 truncate">{p.label}</span>
              <span className="text-[10px] text-gray-400 ml-auto pl-2">{p.pct}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const PERIOD_LABELS: Record<Period, string> = {
  lifetime: "Lifetime",
  year: "Year",
  quarter: "Qtr",
  month: "Month",
  week: "Week",
};

export default function CreatorRevenueBoard({ creator, initialDeals }: { creator: Creator; initialDeals: CreatorDeals | null }) {
  const [deals] = useState<CreatorDeals | null>(initialDeals);
  const loading = false;
  const error = initialDeals === null ? "No deal data found" : null;
  const [period, setPeriod] = useState<Period>("month");

  const periodMap: Record<Exclude<Period, "lifetime">, Record<string, RevenueSlice>> = deals ? {
    month: deals.revenueByMonth,
    quarter: deals.revenueByQuarter,
    year: deals.revenueByYear,
    week: deals.revenueByWeek,
  } : { month: {}, quarter: {}, year: {}, week: {} };

  // Bar chart data — lifetime shows all months
  const barData = period === "lifetime"
    ? chartData(deals?.revenueByMonth ?? {})
    : chartData(periodMap[period]);

  // Stat cards reflect the CURRENT real-world period (e.g. this month, this year)
  // so they change meaningfully when toggling
  const periodStats = (() => {
    if (!deals) return { count: 0, revenue: 0, avg: 0, tgs: 0 };
    if (period === "lifetime") {
      return { count: deals.totalDeals, revenue: deals.totalRevenue, avg: deals.avgDealSize, tgs: deals.tgsRevenue };
    }
    const key = currentPeriodKey(period);
    const slice = periodMap[period][key] ?? { talentCut: 0, tgsCut: 0 };
    const revenue = slice.talentCut + slice.tgsCut;
    const tgs = slice.tgsCut;
    const count = deals.wonDeals.filter((d) => d.wonDate && dateToKey(d.wonDate, period) === key).length;
    return { count, revenue, avg: count > 0 ? Math.round(revenue / count) : 0, tgs };
  })();

  const platformSlices = deals
    ? Object.entries(deals.platformCounts).map(([label, value]) => ({ label, value })).sort((a, b) => b.value - a.value)
    : [];

  const stageSlices = deals
    ? Object.entries(deals.stageCounts).map(([label, value]) => ({ label, value })).sort((a, b) => b.value - a.value)
    : [];

  const ongoingDeals = deals ? [...deals.activeDeals, ...deals.wonDeals.slice(0, 10)] : [];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <TopNav isShare />

      <main className="flex-1 max-w-5xl mx-auto w-full px-6 py-8">
        {/* Back button + breadcrumb */}
        <div className="flex items-center gap-3 mb-6">
          <Link
            href="/revenue"
            className="flex items-center gap-1.5 text-[12px] font-medium text-gray-600 hover:text-gray-900 transition-colors bg-white border border-gray-200 rounded-lg px-3 py-1.5 hover:border-gray-400 hover:shadow-sm"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Revenue
          </Link>
          <div className="flex items-center gap-1.5 text-[11px] text-gray-400">
            <Link href={`/creator/${creator.id}`} className="hover:text-gray-600 transition-colors">{creator.name}</Link>
            <span>/</span>
            <span className="text-gray-600">Revenue</span>
          </div>
        </div>

        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-xl font-semibold text-gray-900">{creator.name}</h1>
            <p className="text-[12px] text-gray-400 mt-0.5">Revenue & Deal Analytics · Monday.com</p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <Link
              href={`/creator/${creator.id}`}
              className="text-[11px] text-gray-400 hover:text-gray-600 transition-colors border border-gray-200 rounded-lg px-3 py-1.5"
            >
              ← Analytics
            </Link>
            <div className="flex rounded-lg border border-gray-200 overflow-hidden text-[10px] bg-white">
              {(["lifetime", "year", "quarter", "month", "week"] as Period[]).map((p) => (
                <button
                  key={p}
                  onClick={() => setPeriod(p)}
                  className={`px-2.5 py-1.5 transition-colors ${period === p ? "bg-gray-900 text-white" : "text-gray-400 hover:text-gray-600"}`}
                >
                  {PERIOD_LABELS[p]}
                </button>
              ))}
            </div>
          </div>
        </div>

        {loading && (
          <div className="grid grid-cols-3 gap-3 mb-6">
            {[...Array(3)].map((_, i) => <div key={i} className="bg-white rounded-xl border border-gray-100 h-24 animate-pulse" />)}
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-100 rounded-xl p-4 text-xs text-red-500">
            {error.includes("MONDAY_API_TOKEN")
              ? "Add MONDAY_API_TOKEN to Vercel environment variables to enable deal data."
              : `Error loading deal data: ${error}`}
          </div>
        )}

        {deals && (
          <>
            {/* 3 summary stat cards — update with period toggle */}
            <div className="grid grid-cols-3 gap-3 mb-6">
              <StatCard
                label="Deals Closed"
                value={String(periodStats.count)}
                sub={period === "lifetime" ? "all time" : `${period === "quarter" ? "this quarter" : `this ${PERIOD_LABELS[period].toLowerCase()}`}`}
              />
              <StatCard label="Avg Deal Size" value={fmt(periodStats.avg)} sub="per deal" />
              <StatCard
                label="Total Revenue"
                value={fmt(periodStats.revenue)}
                sub={`TGS earns ${fmt(periodStats.tgs)}`}
              />
            </div>

            {/* Stacked bar chart */}
            <div className="bg-white rounded-xl border border-gray-100 p-5 mb-4">
              <div className="flex items-center gap-3 mb-4">
                <p className="text-[12px] font-medium text-gray-700">Revenue Over Time</p>
                <span className="flex items-center gap-1 text-[10px] text-gray-500">
                  <span className="w-2.5 h-2.5 rounded-sm inline-block" style={{ backgroundColor: "#3ddc6e" }} />
                  Creator (80%)
                </span>
                <span className="flex items-center gap-1 text-[10px] text-gray-500">
                  <span className="w-2.5 h-2.5 rounded-sm inline-block" style={{ backgroundColor: "#6366f1" }} />
                  TGS (20%)
                </span>
              </div>
              <StackedBarChart data={barData} />
            </div>

            {/* Pie charts */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <PieChart
                title="Platform Distribution"
                slices={platformSlices.length > 0 ? platformSlices : [{ label: "No platform data", value: 1 }]}
              />
              <PieChart title="Deal Stage Distribution" slices={stageSlices} />
            </div>

            {/* Deals table */}
            <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-50">
                <p className="text-[12px] font-medium text-gray-700">All Deals</p>
              </div>
              {ongoingDeals.length === 0 ? (
                <div className="px-5 py-8 text-xs text-gray-300 text-center">No deals found</div>
              ) : (
                <table className="w-full text-[11px]">
                  <thead>
                    <tr className="text-gray-400 border-b border-gray-50">
                      <th className="text-left px-5 py-2.5 font-medium">Deal</th>
                      <th className="text-left px-3 py-2.5 font-medium">Stage</th>
                      <th className="text-left px-3 py-2.5 font-medium">Platforms</th>
                      <th className="text-left px-3 py-2.5 font-medium">Type</th>
                      <th className="text-right px-5 py-2.5 font-medium">Value</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ongoingDeals.map((d) => (
                      <tr key={d.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                        <td className="px-5 py-3">
                          <a
                            href={d.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-gray-800 hover:text-gray-900 hover:underline font-medium truncate block max-w-[260px]"
                          >
                            {d.name}
                          </a>
                          <span className="text-gray-400">{d.group}</span>
                        </td>
                        <td className="px-3 py-3">
                          <span className={`text-[9px] font-medium px-1.5 py-0.5 rounded-full ${stageColor(d.stage)}`}>
                            {d.stage}
                          </span>
                        </td>
                        <td className="px-3 py-3 text-gray-500">
                          {d.platforms.length > 0 ? d.platforms.join(", ") : "—"}
                        </td>
                        <td className="px-3 py-3 text-gray-400">{d.dealType || "—"}</td>
                        <td className="px-5 py-3 text-right font-medium text-gray-800 tabular-nums">
                          {d.dealValue > 0 ? fmt(d.dealValue) : "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}

function StatCard({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-5">
      <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wide mb-1">{label}</p>
      <p className="text-2xl font-semibold text-gray-900 tabular-nums">{value}</p>
      <p className="text-[10px] text-gray-400 mt-0.5">{sub}</p>
    </div>
  );
}
