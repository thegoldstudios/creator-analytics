"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { CREATORS, formatNum } from "@/lib/mock-data";
import { Agent, Platform } from "@/lib/types";

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

const AGENTS: (Agent | "All")[] = ["All", "Maddie", "Elicia", "Olivia", "Seth"];

export default function RosterPage() {
  const [search, setSearch] = useState("");
  const [activeAgent, setActiveAgent] = useState<Agent | "All">("All");

  const filtered = CREATORS.filter((c) => {
    const matchesSearch = c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.handle.toLowerCase().includes(search.toLowerCase());
    const matchesAgent = activeAgent === "All" || c.agent === activeAgent;
    return matchesSearch && matchesAgent;
  });

  return (
    <>
      {/* Top bar */}
      <header className="sticky top-0 z-10 bg-white/90 backdrop-blur border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center gap-4">
          <Image src="/tgs-logo.png" alt="The Gold Studios" width={28} height={28} className="object-contain shrink-0" />
          <span className="text-[13px] font-semibold text-gray-700 tracking-tight hidden sm:block">The Gold Studios</span>
          <span className="text-gray-200 hidden sm:block">|</span>

          {/* Search */}
          <div className="relative flex-1 max-w-xs">
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

          <div className="ml-auto flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#3ddc6e] animate-pulse" />
            <span className="text-[11px] text-gray-400 font-medium hidden sm:block">Live</span>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Agent filter */}
        <div className="flex items-center gap-2 flex-wrap mb-7">
          {AGENTS.map((agent) => {
            const count = agent === "All"
              ? CREATORS.length
              : CREATORS.filter((c) => c.agent === agent).length;
            const isActive = activeAgent === agent;
            return (
              <button
                key={agent}
                onClick={() => setActiveAgent(agent)}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[13px] font-medium transition-all border ${
                  isActive
                    ? "bg-gray-900 text-white border-gray-900"
                    : "bg-white text-gray-500 border-gray-200 hover:border-gray-400 hover:text-gray-800"
                }`}
              >
                {agent}
                <span className={`text-[11px] px-1.5 py-0.5 rounded-full font-semibold ${
                  isActive ? "bg-white/20 text-white" : "bg-gray-100 text-gray-500"
                }`}>
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

        {filtered.length === 0 ? (
          <div className="text-center py-24 text-gray-300 text-sm">
            {search ? `No creators matching "${search}"` : `No creators assigned to ${activeAgent} yet.`}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {filtered.map((creator) => {
              const firstPlatform = creator.platforms[0];
              const data = creator.analytics[firstPlatform];
              const topCountry = data?.topCountries[0];
              return (
                <Link
                  key={creator.id}
                  href={`/creator/${creator.id}`}
                  className="group bg-white rounded-2xl p-5 border border-gray-100 hover:border-gray-200 hover:shadow-md transition-all duration-200 block"
                >
                  <div className="flex items-center gap-3 mb-4">
                    {/* Profile picture */}
                    <div className="w-10 h-10 rounded-full bg-gray-100 shrink-0 overflow-hidden relative">
                      {creator.photoUrl ? (
                        <Image
                          src={creator.photoUrl}
                          alt={creator.name}
                          fill
                          className="object-cover"
                          unoptimized
                          onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                        />
                      ) : null}
                      {/* Initials fallback (always rendered, hidden when image loads) */}
                      <span className="absolute inset-0 flex items-center justify-center text-xs font-semibold text-gray-600 -z-10">
                        {creator.avatar}
                      </span>
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
                    <div className="grid grid-cols-2 gap-x-4 gap-y-3 pt-3.5 border-t border-gray-50">
                      <div>
                        <p className="text-[9px] text-gray-400 uppercase tracking-widest mb-0.5">Engagement</p>
                        <p className="text-[15px] font-semibold text-gray-900">{data.engagementRate}%</p>
                      </div>
                      <div>
                        <p className="text-[9px] text-gray-400 uppercase tracking-widest mb-0.5">Avg Views</p>
                        <p className="text-[15px] font-semibold text-gray-900">{formatNum(data.avgViews)}</p>
                      </div>
                      <div>
                        <p className="text-[9px] text-gray-400 uppercase tracking-widest mb-0.5">Top Country</p>
                        <p className="text-[15px] font-semibold text-gray-900">
                          {topCountry ? `${topCountry.flag} ${topCountry.pct}%` : "—"}
                        </p>
                      </div>
                      <div>
                        <p className="text-[9px] text-gray-400 uppercase tracking-widest mb-0.5">Followers</p>
                        <p className="text-[15px] font-semibold text-gray-900">{formatNum(data.followers)}</p>
                      </div>
                    </div>
                  )}
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
