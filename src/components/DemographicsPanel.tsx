"use client";

import { useState } from "react";
import { PlatformAnalytics, DemographicBar } from "@/lib/types";

interface Props {
  data: PlatformAnalytics;
}

export default function DemographicsPanel({ data }: Props) {
  const [ageFilter, setAgeFilter] = useState<"all" | "male" | "female">("all");
  const bars: DemographicBar[] = data.ageGender[ageFilter];
  const maxBar = Math.max(...bars.map((b) => b.value));

  return (
    <div>
      <p className="text-[11px] font-semibold uppercase tracking-widest text-gray-400 mb-4">Audience Demographics</p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">

        {/* Gender */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 mb-5">Gender</p>
          <div className="flex items-center justify-center mb-5">
            <div className="relative w-24 h-24">
              <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                <circle cx="18" cy="18" r="15.9155" fill="none" stroke="#f3f4f6" strokeWidth="3.5" />
                <circle cx="18" cy="18" r="15.9155" fill="none" stroke="#3ddc6e" strokeWidth="3.5"
                  strokeDasharray={`${data.gender.female} ${100 - data.gender.female}`}
                  strokeLinecap="round"
                />
                <circle cx="18" cy="18" r="15.9155" fill="none" stroke="#d1fae5" strokeWidth="3.5"
                  strokeDasharray={`${data.gender.male} ${100 - data.gender.male}`}
                  strokeDashoffset={`-${data.gender.female}`}
                  strokeLinecap="round"
                />
              </svg>
            </div>
          </div>
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#3ddc6e] inline-block" />
                <span className="text-[13px] text-gray-600">Female</span>
              </div>
              <span className="text-[13px] font-semibold text-gray-900">{data.gender.female}%</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#d1fae5] border border-[#3ddc6e]/30 inline-block" />
                <span className="text-[13px] text-gray-600">Male</span>
              </div>
              <span className="text-[13px] font-semibold text-gray-900">{data.gender.male}%</span>
            </div>
          </div>
        </div>

        {/* Age & Gender */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 mb-3">Age and Gender</p>
          <div className="flex gap-1.5 mb-5">
            {(["all", "male", "female"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setAgeFilter(f)}
                className={`px-3 py-1 rounded-full text-[11px] font-medium border transition-all capitalize ${
                  ageFilter === f
                    ? "bg-gray-900 text-white border-gray-900"
                    : "text-gray-500 border-gray-200 hover:border-gray-300"
                }`}
              >
                {f === "all" ? "All" : f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
          <div className="space-y-3.5">
            {bars.map((bar) => (
              <div key={bar.label}>
                <div className="flex justify-between mb-1.5">
                  <span className="text-[12px] text-gray-500">{bar.label}</span>
                  <span className="text-[12px] font-semibold text-gray-900">{bar.value}%</span>
                </div>
                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-300"
                    style={{ width: `${(bar.value / maxBar) * 100}%`, backgroundColor: "#3ddc6e" }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Countries */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 mb-5">Top Countries</p>
          <div className="space-y-3.5">
            {data.topCountries.map((c) => (
              <div key={c.country}>
                <div className="flex justify-between mb-1.5">
                  <span className="flex items-center gap-1.5 text-[13px] text-gray-700">
                    <span>{c.flag}</span>
                    <span>{c.country}</span>
                  </span>
                  <span className="text-[13px] font-semibold text-gray-900">{c.pct}%</span>
                </div>
                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${c.pct}%`, backgroundColor: "#3ddc6e" }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
