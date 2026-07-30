"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import Footer from "@/components/Footer";
import CreatorAvatar from "@/components/CreatorAvatar";
import { Agent } from "@/lib/types";

export interface CreatorRevSummary {
  talentProfileId: string;
  talentName: string;
  totalDeals: number;
  totalRevenue: number;
  avgDealSize: number;
  tgsRevenue: number;
  activeDeals: number;
  creatorId: string | null;
  agent: Agent | null;
  photoUrl: string | null;
  avatar: string | null;
  talentStatus: string | null;
}

interface Props {
  summaries: CreatorRevSummary[];
  error: string | null;
}

const AGENTS: (Agent | "All")[] = ["All", "Maddie", "Elicia", "Olivia", "Seth", "Kelvin", "Emerson"];

function fmtNum(n: number) {
  if (n >= 1_000_000) return `£${(n / 1_000_000).toFixed(1)}m`;
  if (n >= 1_000) return `£${(n / 1_000).toFixed(1)}k`;
  return `£${Math.round(n).toLocaleString()}`;
}

export default function RevenueDashboard({ summaries, error }: Props) {
  const [search, setSearch] = useState("");
  const [activeAgent, setActiveAgent] = useState<Agent | "All">("All");

  const filtered = useMemo(() => summaries.filter((s) => {
    const matchSearch = s.talentName.toLowerCase().includes(search.toLowerCase());
    const matchAgent = activeAgent === "All" || s.agent === activeAgent;
    return matchSearch && matchAgent;
  }), [summaries, search, activeAgent]);

  // Stats computed from the filtered set so they update with pod toggle
  const stats = useMemo(() => {
    const totalDeals = filtered.reduce((s, c) => s + c.totalDeals, 0);
    const totalRevenue = filtered.reduce((s, c) => s + c.totalRevenue, 0);
    const avgDealSize = totalDeals > 0 ? Math.round(totalRevenue / totalDeals) : 0;
    const tgsRevenue = filtered.reduce((s, c) => s + c.tgsRevenue, 0);
    const activeCount = filtered.reduce((s, c) => s + c.activeDeals, 0);
    return { totalDeals, totalRevenue, avgDealSize, tgsRevenue, activeCount };
  }, [filtered]);

  const agentCount = (agent: Agent | "All") =>
    agent === "All" ? summaries.length : summaries.filter((s) => s.agent === agent).length;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white/90 backdrop-blur border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center gap-4">
          <Image src="/tgs-logo.png" alt="The Gold Studios" width={28} height={28} className="object-contain shrink-0" />
          <span className="text-[13px] font-semibold text-gray-700 tracking-tight hidden sm:block">The Gold Studios</span>
          <span className="text-gray-200 hidden sm:block">|</span>

          <nav className="flex items-center gap-1">
            <Link href="/" className="px-3 py-1.5 rounded-lg text-[13px] font-medium text-gray-400 hover:text-gray-700 hover:bg-gray-50 transition-colors">
              Analytics
            </Link>
            <Link href="/revenue" className="px-3 py-1.5 rounded-lg text-[13px] font-medium bg-gray-900 text-white">
              Revenue
            </Link>
          </nav>

          <div className="relative flex-1 max-w-xs mx-auto">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search creators…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-[13px] rounded-lg border border-gray-200 bg-gray-50 focus:outline-none focus:border-gray-400 placeholder:text-gray-300 transition-colors"
            />
          </div>

          <div className="flex items-center gap-1.5 ml-auto">
            <span className="w-2 h-2 rounded-full bg-[#3ddc6e] animate-pulse" />
            <span className="text-[11px] text-gray-400 font-medium hidden sm:block">Live · Monday</span>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-6xl mx-auto w-full px-6 py-8">
        {/* Pod filter tabs */}
        <div className="flex items-center gap-2 flex-wrap mb-7">
          {AGENTS.map((agent) => {
            const count = agentCount(agent);
            const active = activeAgent === agent;
            return (
              <button
                key={agent}
                onClick={() => setActiveAgent(agent)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[13px] font-medium transition-colors ${
                  active ? "bg-gray-900 text-white" : "bg-white border border-gray-200 text-gray-500 hover:border-gray-400 hover:text-gray-700"
                }`}
              >
                {agent}
                <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${active ? "bg-white/20 text-white" : "bg-gray-100 text-gray-400"}`}>
                  {count}
                </span>
              </button>
            );
          })}
          <span className="text-[12px] text-gray-400 ml-1">
            {filtered.length} creator{filtered.length !== 1 ? "s" : ""}
            {search && ` matching "${search}"`}
          </span>
        </div>

        {error ? (
          <div className="bg-red-50 border border-red-100 rounded-xl p-4 text-xs text-red-500 mb-6">
            {error.includes("MONDAY_API_TOKEN")
              ? "Add MONDAY_API_TOKEN to Vercel environment variables."
              : `Error: ${error}`}
          </div>
        ) : (
          <>
            {/* Stats — update with pod filter */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-7">
              <StatWidget label="Active Leads" value={String(stats.activeCount)} sub="in pipeline now" accent />
              <StatWidget label="Deals Signed & Underway" value={String(stats.totalDeals)} sub="won + complete" />
              <StatWidget label="Total Revenue" value={fmtNum(stats.totalRevenue)} sub="all time" />
              <StatWidget label="Avg Deal Size" value={fmtNum(stats.avgDealSize)} sub="per deal" />
            </div>

            {filtered.length === 0 ? (
              <div className="text-center py-24 text-gray-300 text-sm">
                {search ? `No creators matching "${search}"` : `No creators in ${activeAgent}'s pod yet.`}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {filtered.map((s) => {
                  const href = s.creatorId
                    ? `/creator/${s.creatorId}/revenue`
                    : `/revenue/talent/${s.talentProfileId}`;
                  const initials = s.avatar ?? s.talentName.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
                  const card = (
                    <div className="relative group bg-white rounded-2xl border border-gray-100 p-5 hover:border-gray-200 hover:shadow-sm transition-all cursor-pointer">
                      <div className="absolute top-4 right-4">
                        <svg className="w-4 h-4 text-gray-200 group-hover:text-gray-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                        </svg>
                      </div>

                      {/* Avatar + name */}
                      <div className="flex items-center gap-3 mb-4 pr-6">
                        <div className="relative w-10 h-10 shrink-0">
                          {s.photoUrl ? (
                            <Image src={s.photoUrl} alt={s.talentName} fill className="object-cover rounded-full" unoptimized />
                          ) : (
                            <CreatorAvatar name={s.talentName} initials={initials} size="sm" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="text-[13px] font-semibold text-gray-900 truncate">{s.talentName}</p>
                          {s.agent && <p className="text-[11px] text-gray-400">{s.agent}</p>}
                        </div>
                      </div>

                      {/* Stats grid */}
                      <div className="grid grid-cols-2 gap-x-4 gap-y-3 pt-3.5 border-t border-gray-50">
                        <Stat label="Avg Deal" value={s.avgDealSize > 0 ? fmtNum(s.avgDealSize) : "—"} />
                        <Stat label="Revenue" value={s.totalRevenue > 0 ? fmtNum(s.totalRevenue) : "—"} />
                        <Stat label="Deals Won" value={String(s.totalDeals)} />
                        <div>
                          <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-0.5">Status</p>
                          {s.talentStatus ? (
                            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${statusColor(s.talentStatus)}`}>
                              {s.talentStatus}
                            </span>
                          ) : (
                            <p className="text-[15px] font-semibold text-gray-900">—</p>
                          )}
                        </div>
                      </div>

                      {s.activeDeals > 0 && (
                        <div className="mt-3 pt-3 border-t border-gray-50 flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                          <span className="text-[11px] font-semibold text-emerald-700">
                            {s.activeDeals} active lead{s.activeDeals !== 1 ? "s" : ""}
                          </span>
                          <span className="text-[10px] text-gray-400">in pipeline</span>
                        </div>
                      )}
                    </div>
                  );

                  return <Link key={s.talentProfileId} href={href}>{card}</Link>;
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

function statusColor(s: string): string {
  const l = s.toLowerCase();
  if (l.includes("urgent")) return "bg-red-100 text-red-600";
  if (l.includes("push")) return "bg-yellow-100 text-yellow-700";
  if (l.includes("leav")) return "bg-orange-100 text-orange-600";
  if (l.includes("happy")) return "bg-emerald-100 text-emerald-700";
  if (l.includes("unhappy")) return "bg-red-50 text-red-500";
  if (l.includes("static")) return "bg-amber-100 text-amber-700";
  if (l.includes("new")) return "bg-gray-100 text-gray-500";
  return "bg-gray-100 text-gray-600";
}

function StatWidget({ label, value, sub, accent }: { label: string; value: string; sub: string; accent?: boolean }) {
  return (
    <div className={`rounded-xl border p-4 ${accent ? "bg-emerald-50 border-emerald-100" : "bg-white border-gray-100"}`}>
      <p className={`text-[10px] font-medium uppercase tracking-wide mb-1 ${accent ? "text-emerald-600" : "text-gray-400"}`}>{label}</p>
      <p className={`text-xl font-semibold tabular-nums ${accent ? "text-emerald-700" : "text-gray-900"}`}>{value}</p>
      <p className={`text-[10px] mt-0.5 ${accent ? "text-emerald-500" : "text-gray-400"}`}>{sub}</p>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-0.5">{label}</p>
      <p className="text-[15px] font-semibold text-gray-900 tabular-nums">{value}</p>
    </div>
  );
}
