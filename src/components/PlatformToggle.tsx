"use client";

import { Platform } from "@/lib/types";
import { PLATFORM_LABELS } from "@/lib/mock-data";

interface Props {
  available: Platform[];
  active: Platform;
  onChange: (p: Platform) => void;
}

const ACTIVE_STYLES: Record<Platform, string> = {
  tiktok: "bg-gray-900 text-white border-gray-900",
  instagram: "bg-gradient-to-r from-pink-500 to-purple-500 text-white border-transparent",
  youtube_shorts: "bg-red-500 text-white border-red-500",
  youtube_longform: "bg-red-700 text-white border-red-700",
};

export default function PlatformToggle({ available, active, onChange }: Props) {
  return (
    <div className="flex gap-2 flex-wrap">
      {available.map((p) => (
        <button
          key={p}
          onClick={() => onChange(p)}
          className={`px-4 py-1.5 rounded-full text-[13px] font-medium border transition-all duration-150 ${
            active === p
              ? ACTIVE_STYLES[p]
              : "bg-white text-gray-500 border-gray-200 hover:border-gray-300 hover:text-gray-700"
          }`}
        >
          {PLATFORM_LABELS[p]}
        </button>
      ))}
    </div>
  );
}
