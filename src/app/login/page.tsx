"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function LoginPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });

    if (res.ok) {
      router.push("/");
      router.refresh();
    } else {
      setError("Incorrect password. Try again.");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#f7f7f7] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <Image src="/tgs-logo.png" alt="The Gold Studios" width={52} height={52} className="object-contain mb-4" />
          <h1 className="text-[17px] font-semibold text-gray-900 tracking-tight">The Gold Studios</h1>
          <p className="text-[13px] text-gray-400 mt-0.5">Creator Analytics</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl border border-gray-100 p-7 shadow-sm">
          <h2 className="text-[15px] font-semibold text-gray-900 mb-1">Sign in</h2>
          <p className="text-[13px] text-gray-400 mb-6">Enter the team password to continue.</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <input
                type="password"
                placeholder="Team password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2.5 text-[14px] rounded-xl border border-gray-200 focus:outline-none focus:border-gray-400 bg-gray-50 placeholder:text-gray-300 transition-colors"
                autoFocus
                required
              />
            </div>

            {error && (
              <p className="text-[12px] text-red-500">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-gray-900 text-white text-[14px] font-medium rounded-xl hover:bg-gray-800 transition-colors disabled:opacity-50"
            >
              {loading ? "Signing in…" : "Sign in"}
            </button>
          </form>
        </div>

        <p className="text-center text-[11px] text-gray-300 mt-6">
          The Gold Studios · Creator Analytics Platform
        </p>
      </div>
    </div>
  );
}
