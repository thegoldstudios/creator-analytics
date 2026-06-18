"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

interface ConnectStatus {
  creatorId: string;
  name: string;
  platforms: string[];
  connected: string[];
}

export default function ConnectPage({ params }: { params: Promise<{ token: string }> }) {
  const [token, setToken] = useState<string | null>(null);
  const [status, setStatus] = useState<ConnectStatus | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    params.then((p) => setToken(p.token));
  }, [params]);

  useEffect(() => {
    if (!token) return;
    fetch(`/api/connect/status?token=${token}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.error) setError(data.error);
        else setStatus(data);
      })
      .catch(() => setError("Failed to load."));
  }, [token]);

  if (error) {
    return (
      <div className="min-h-screen bg-[#f7f7f7] flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-gray-400 text-[14px]">{error}</p>
        </div>
      </div>
    );
  }

  if (!status) {
    return (
      <div className="min-h-screen bg-[#f7f7f7] flex items-center justify-center">
        <div className="w-5 h-5 border-2 border-gray-200 border-t-gray-400 rounded-full animate-spin" />
      </div>
    );
  }

  const platformConfig: Record<string, { label: string; color: string; bg: string }> = {
    youtube: { label: "YouTube", color: "text-white", bg: "bg-red-500 hover:bg-red-600" },
    instagram: { label: "Instagram", color: "text-white", bg: "bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600" },
    tiktok: { label: "TikTok", color: "text-white", bg: "bg-gray-900 hover:bg-gray-800" },
  };

  const creatorPlatformKeys = status.platforms.flatMap((p) => {
    if (p === "youtube_shorts" || p === "youtube_longform") return ["youtube"];
    if (p === "instagram") return ["instagram"];
    if (p === "tiktok") return ["tiktok"];
    return [];
  });
  const uniquePlatforms = [...new Set(creatorPlatformKeys)];

  return (
    <div className="min-h-screen bg-[#f7f7f7] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-8">
          <Image src="/tgs-logo.png" alt="The Gold Studios" width={48} height={48} className="object-contain mb-4" />
          <h1 className="text-[17px] font-semibold text-gray-900 tracking-tight">Connect your accounts</h1>
          <p className="text-[13px] text-gray-400 mt-1">Hi {status.name} — link your platforms below</p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm space-y-3">
          {uniquePlatforms.map((p) => {
            const cfg = platformConfig[p];
            const isConnected = status.connected.includes(p);
            return (
              <div key={p} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {isConnected && (
                    <span className="w-2 h-2 rounded-full bg-[#3ddc6e]" />
                  )}
                  {!isConnected && (
                    <span className="w-2 h-2 rounded-full bg-gray-200" />
                  )}
                  <span className="text-[14px] font-medium text-gray-800">{cfg.label}</span>
                </div>
                {isConnected ? (
                  <span className="text-[12px] text-[#3ddc6e] font-medium">Connected</span>
                ) : (
                  <a
                    href={`/api/auth/${p}?token=${token}`}
                    className={`px-4 py-1.5 rounded-full text-[13px] font-medium transition-colors ${cfg.bg} ${cfg.color}`}
                  >
                    Connect
                  </a>
                )}
              </div>
            );
          })}
        </div>

        <p className="text-center text-[11px] text-gray-300 mt-6">
          Your data is only shared with The Gold Studios team.
        </p>
      </div>
    </div>
  );
}
