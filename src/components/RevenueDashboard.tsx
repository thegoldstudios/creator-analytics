"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import Footer from "@/components/Footer";
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
}

interface Stats {
  totalDeals: number;
  totalRevenue: string;
  avgDealSize: string;
  tgsRevenue: string;
  activeCount: number;
}

interface Props {
  summaries: CreatorRevSummary[];
  stats: Stats;
  error: string | null;
}

const AGENTS: (Agent | "All")[] = ["All", "Maddie", "Elicia", "Olivia", "Seth"];

export default function RevenueDashboard({ summaries, stats, error }: Props) {
  const [search, setSearch] = useState("");
  const [activeAgent, setActiveAgent] = useState<Agent | "All">("All");

  const filtered = summaries.filter((s) => {
    const matchSearch = s.talentName.toLowerCase().includes(search.toLowerCase());
    const matchAgent = activeAgent === "All" || s.agent === activeAgent;
    return matchSearch && matchAgent;
  });

  // Count per agent for badges
  const agentCount = (agent: Agent | "All") =>
    agent === "All"
      ? summaries.length
      : summaries.filter((s) => s.agent === agent).length;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header — identical structure to analytics page */}
      <header className="sticky top-0 z-10 bg-white/90 backdrop-blur border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center gap-4">
          <Image src="/tgs-logo.png" alt="The Gold Studios" width={28} height={28} className="object-contain shrink-0" />
          <span className="text-[13px] font-semibold text-gray-700 tracking-tight hidden sm:block">The Gold Studios</span>
          <span className="text-gray-200 hidden sm:block">|</span>

          {/* Section tabs */}
          <nav className="flex items-center gap-1">
            <Link href="/" className="px-3 py-1.5 rounded-lg text-[13px] font-medium text-gray-400 hover:text-gray-700 hover:bg-gray-50 transition-colors">
              Analytics
            </Link>
            <Link href="/revenue" className="px-3 py-1.5 rounded-lg text-[13px] font-medium bg-gray-900 text-white">
              Revenue
            </Link>
          </nav>

          {/* Search bar — centre */}
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
        {/* Agent / Pod filter tabs */}
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
            {/* 4 summary stat widgets */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-7">
              <StatWidget label="Deals Closed" value={String(stats.totalDeals)} sub="won + complete" />
              <StatWidget label="Total Revenue" value={stats.totalRevenue} sub="creator earnings" />
              <StatWidget label="Avg Deal Size" value={stats.avgDealSize} sub="per deal" />
              <StatWidget label="TGS Commission" value={stats.tgsRevenue} sub={`${stats.activeCount} active leads`} />
            </div>

            {/* Creator cards */}
            {filtered.length === 0 ? (
              <div className="text-center py-24 text-gray-300 text-sm">
                {search ? `No creators matching "${search}"` : `No creators in ${activeAgent}'s pod yet.`}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {filtered.map((s) => {
                  const href = s.creatorId ? `/creator/${s.creatorId}/revenue` : null;
                  const card = (
                    <div className="relative group bg-white rounded-2xl border border-gray-100 p-5 hover:border-gray-200 hover:shadow-sm transition-all cursor-pointer">
                      {/* Chevron */}
                      {href && (
                        <div className="absolute top-4 right-4">
                          <svg className="w-4 h-4 text-gray-200 group-hover:text-gray-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                          </svg>
                        </div>
                      )}

                      {/* Name + agent */}
                      <div className="mb-4 pr-6">
                        <p className="text-[13px] font-semibold text-gray-900 truncate">{s.talentName}</p>
                        {s.agent && (
                          <p className="text-[11px] text-gray-400 mt-0.5">{s.agent}</p>
                        )}
                      </div>

                      {/* Stats grid — same 2×2 layout as analytics cards */}
                      <div className="grid grid-cols-2 gap-x-4 gap-y-3 pt-3.5 border-t border-gray-50">
                        <Stat label="Avg Deal" value={s.avgDealSize > 0 ? `£${s.avgDealSize >= 1000 ? (s.avgDealSize / 1000).toFixed(1) + "k" : s.avgDealSize.toLocaleString()}` : "—"} />
                        <Stat label="Revenue" value={s.totalRevenue > 0 ? `£${s.totalRevenue >= 1000 ? (s.totalRevenue / 1000).toFixed(1) + "k" : s.totalRevenue.toLocaleString()}` : "—"} />
                        <Stat label="Deals Won" value={String(s.totalDeals)} />
                        <Stat label="TGS Cut" value={s.tgsRevenue > 0 ? `£${s.tgsRevenue >= 1000 ? (s.tgsRevenue / 1000).toFixed(1) + "k" : s.tgsRevenue.toLocaleString()}` : "—"} />
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

function StatWidget({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-4">
      <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wide mb-1">{label}</p>
      <p className="text-xl font-semibold text-gray-900 tabular-nums">{value}</p>
      <p className="text-[10px] text-gray-400 mt-0.5">{sub}</p>
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
