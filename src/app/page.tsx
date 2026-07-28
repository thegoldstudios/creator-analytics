"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import CreatorAvatar from "@/components/CreatorAvatar";
import Footer from "@/components/Footer";
import { formatNum } from "@/lib/mock-data";
import { Agent, Creator, Platform } from "@/lib/types";

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

const ALL_PLATFORMS: Platform[] = ["tiktok", "instagram", "youtube_shorts", "youtube_longform"];
const AGENTS: (Agent | "All")[] = ["All", "Maddie", "Elicia", "Olivia", "Seth"];
const AGENT_OPTIONS: Agent[] = ["Maddie", "Elicia", "Olivia", "Seth"];

const BLANK_FORM = {
  name: "",
  handle: "",
  category: "",
  agent: "Maddie" as Agent,
  platforms: [] as Platform[],
  youtubeHandle: "",
  photoUrl: "",
};

export default function RosterPage() {
  const [creators, setCreators] = useState<Creator[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeAgent, setActiveAgent] = useState<Agent | "All">("All");

  // Modal state
  const [modal, setModal] = useState<"add" | "edit" | null>(null);
  const [editing, setEditing] = useState<Creator | null>(null);
  const [form, setForm] = useState(BLANK_FORM);
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [fetchingPhoto, setFetchingPhoto] = useState(false);
  const [photoFetchError, setPhotoFetchError] = useState("");

  const fetchCreators = useCallback(async () => {
    const res = await fetch("/api/creators");
    const data = await res.json();
    setCreators(data);
    setLoading(false);
  }, []);

  useEffect(() => { fetchCreators(); }, [fetchCreators]);

  const filtered = creators.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.handle.toLowerCase().includes(search.toLowerCase());
    const matchesAgent = activeAgent === "All" || c.agent === activeAgent;
    return matchesSearch && matchesAgent;
  });

  function openAdd() {
    setForm(BLANK_FORM);
    setEditing(null);
    setPhotoFetchError("");
    setModal("add");
  }

  function openEdit(c: Creator, e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    setForm({
      name: c.name,
      handle: c.handle,
      category: c.category,
      agent: c.agent,
      platforms: [...c.platforms],
      youtubeHandle: c.youtubeHandle ?? "",
      photoUrl: c.photoUrl ?? "",
    });
    setEditing(c);
    setPhotoFetchError("");
    setModal("edit");
  }

  async function fetchPhoto() {
    if (!form.youtubeHandle.trim()) return;
    setFetchingPhoto(true);
    setPhotoFetchError("");
    try {
      const res = await fetch(`/api/creators/photo?youtubeHandle=${encodeURIComponent(form.youtubeHandle.trim())}`);
      const data = await res.json();
      if (data.photoUrl) {
        setForm((f) => ({ ...f, photoUrl: data.photoUrl }));
      } else {
        setPhotoFetchError("Channel not found");
      }
    } catch {
      setPhotoFetchError("Failed to fetch");
    } finally {
      setFetchingPhoto(false);
    }
  }

  function togglePlatform(p: Platform) {
    setForm((f) => ({
      ...f,
      platforms: f.platforms.includes(p)
        ? f.platforms.filter((x) => x !== p)
        : [...f.platforms, p],
    }));
  }

  async function handleSave() {
    if (!form.name.trim() || !form.handle.trim()) return;
    setSaving(true);
    try {
      if (modal === "add") {
        const res = await fetch("/api/creators", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...form, photoUrl: form.photoUrl || undefined }),
        });
        const created = await res.json();
        setCreators((prev) => [...prev, created]);
      } else if (modal === "edit" && editing) {
        const res = await fetch(`/api/creators/${editing.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
        const updated = await res.json();
        setCreators((prev) => prev.map((c) => (c.id === editing.id ? updated : c)));
      }
      setModal(null);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    await fetch(`/api/creators/${id}`, { method: "DELETE" });
    setCreators((prev) => prev.filter((c) => c.id !== id));
    setDeleteConfirm(null);
    setModal(null);
  }

  return (
    <>
      {/* Top bar */}
      <header className="sticky top-0 z-10 bg-white/90 backdrop-blur border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center gap-4">
          <Image src="/tgs-logo.png" alt="The Gold Studios" width={28} height={28} className="object-contain shrink-0" />
          <span className="text-[13px] font-semibold text-gray-700 tracking-tight hidden sm:block">The Gold Studios</span>
          <span className="text-gray-200 hidden sm:block">|</span>

          {/* Section tabs — same position as Revenue page */}
          <nav className="flex items-center gap-1">
            <Link href="/" className="px-3 py-1.5 rounded-lg text-[13px] font-medium bg-gray-900 text-white">
              Analytics
            </Link>
            <Link href="/revenue" className="px-3 py-1.5 rounded-lg text-[13px] font-medium text-gray-400 hover:text-gray-700 hover:bg-gray-50 transition-colors">
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

          <div className="ml-auto flex items-center gap-3">
            <button
              onClick={openAdd}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-900 text-white text-[13px] font-medium hover:bg-gray-700 transition-colors"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              Add Creator
            </button>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#3ddc6e] animate-pulse" />
              <span className="text-[11px] text-gray-400 font-medium hidden sm:block">Live</span>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Agent filter */}
        <div className="flex items-center gap-2 flex-wrap mb-7">
          {AGENTS.map((agent) => {
            const count = agent === "All"
              ? creators.length
              : creators.filter((c) => c.agent === agent).length;
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

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-44 rounded-2xl bg-gray-100 animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-24 text-gray-300 text-sm">
            {search ? `No creators matching "${search}"` : `No creators assigned to ${activeAgent} yet.`}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {filtered.map((creator) => {
              const firstPlatform = creator.platforms[0];
              const data = firstPlatform ? creator.analytics[firstPlatform] : undefined;
              const topCountry = data?.topCountries[0];
              return (
                <div key={creator.id} className="relative group">
                  <Link
                    href={`/creator/${creator.id}`}
                    className="bg-white rounded-2xl p-5 border border-gray-100 hover:border-gray-200 hover:shadow-md transition-all duration-200 block"
                  >
                    <div className="flex items-center gap-3 mb-4">
                      {creator.photoUrl ? (
                        <div className="w-10 h-10 rounded-full shrink-0 overflow-hidden relative">
                          <Image src={creator.photoUrl} alt={creator.name} fill className="object-cover" unoptimized />
                        </div>
                      ) : (
                        <CreatorAvatar name={creator.name} initials={creator.avatar} size="sm" />
                      )}
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

                    {data ? (
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
                    ) : (
                      <div className="pt-3.5 border-t border-gray-50">
                        <p className="text-[12px] text-gray-300 italic">No analytics yet</p>
                      </div>
                    )}
                  </Link>

                  {/* Edit button overlay */}
                  <button
                    onClick={(e) => openEdit(creator, e)}
                    className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity bg-white border border-gray-200 rounded-lg p-1.5 shadow-sm hover:bg-gray-50 z-10"
                    title="Edit creator"
                  >
                    <svg className="w-3.5 h-3.5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536M9 13l6.586-6.586a2 2 0 0 1 2.828 2.828L11.828 15.828a2 2 0 0 1-1.414.586H7v-3.414a2 2 0 0 1 .586-1.414z" />
                    </svg>
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add / Edit Modal */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-[16px] font-semibold text-gray-900">
                {modal === "add" ? "Add Creator" : "Edit Creator"}
              </h2>
              <button onClick={() => setModal(null)} className="text-gray-400 hover:text-gray-600">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-[12px] font-medium text-gray-600 mb-1">Name *</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder="e.g. Phoebe Is Ginger"
                  className="w-full px-3 py-2 text-[13px] border border-gray-200 rounded-lg focus:outline-none focus:border-gray-400"
                />
              </div>

              <div>
                <label className="block text-[12px] font-medium text-gray-600 mb-1">Handle *</label>
                <input
                  type="text"
                  value={form.handle}
                  onChange={(e) => setForm((f) => ({ ...f, handle: e.target.value }))}
                  placeholder="@handle"
                  className="w-full px-3 py-2 text-[13px] border border-gray-200 rounded-lg focus:outline-none focus:border-gray-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[12px] font-medium text-gray-600 mb-1">Category</label>
                  <input
                    type="text"
                    value={form.category}
                    onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                    placeholder="e.g. Comedy"
                    className="w-full px-3 py-2 text-[13px] border border-gray-200 rounded-lg focus:outline-none focus:border-gray-400"
                  />
                </div>
                <div>
                  <label className="block text-[12px] font-medium text-gray-600 mb-1">Agent</label>
                  <select
                    value={form.agent}
                    onChange={(e) => setForm((f) => ({ ...f, agent: e.target.value as Agent }))}
                    className="w-full px-3 py-2 text-[13px] border border-gray-200 rounded-lg focus:outline-none focus:border-gray-400 bg-white"
                  >
                    {AGENT_OPTIONS.map((a) => (
                      <option key={a} value={a}>{a}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[12px] font-medium text-gray-600 mb-2">Platforms</label>
                <div className="flex flex-wrap gap-2">
                  {ALL_PLATFORMS.map((p) => {
                    const active = form.platforms.includes(p);
                    return (
                      <button
                        key={p}
                        type="button"
                        onClick={() => togglePlatform(p)}
                        className={`text-[11px] font-semibold px-3 py-1.5 rounded-full border transition-all ${
                          active
                            ? "bg-gray-900 text-white border-gray-900"
                            : "bg-white text-gray-500 border-gray-200 hover:border-gray-400"
                        }`}
                      >
                        {PLATFORM_LABEL[p]}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-[12px] font-medium text-gray-600 mb-1">YouTube Handle <span className="text-gray-400 font-normal">(for live stats)</span></label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={form.youtubeHandle}
                    onChange={(e) => setForm((f) => ({ ...f, youtubeHandle: e.target.value }))}
                    placeholder="e.g. niallnochill"
                    className="flex-1 px-3 py-2 text-[13px] border border-gray-200 rounded-lg focus:outline-none focus:border-gray-400"
                  />
                  <button
                    type="button"
                    onClick={fetchPhoto}
                    disabled={!form.youtubeHandle.trim() || fetchingPhoto}
                    className="px-3 py-2 text-[12px] font-medium border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-40 transition-colors whitespace-nowrap"
                  >
                    {fetchingPhoto ? "…" : "Fetch photo"}
                  </button>
                </div>
                {photoFetchError && <p className="text-[11px] text-red-400 mt-1">{photoFetchError}</p>}
              </div>

              <div>
                <label className="block text-[12px] font-medium text-gray-600 mb-1">
                  Profile Photo
                  {form.photoUrl && (
                    <button
                      type="button"
                      onClick={() => setForm((f) => ({ ...f, photoUrl: "" }))}
                      className="ml-2 text-red-400 hover:text-red-600 font-normal"
                    >
                      remove
                    </button>
                  )}
                </label>
                {form.photoUrl ? (
                  <div className="flex items-center gap-3">
                    <img src={form.photoUrl} alt="Preview" className="w-12 h-12 rounded-full object-cover border border-gray-200" />
                    <p className="text-[11px] text-gray-400 truncate flex-1">{form.photoUrl}</p>
                  </div>
                ) : (
                  <input
                    type="text"
                    value={form.photoUrl}
                    onChange={(e) => setForm((f) => ({ ...f, photoUrl: e.target.value }))}
                    placeholder="Paste an image URL, or use Fetch photo above"
                    className="w-full px-3 py-2 text-[13px] border border-gray-200 rounded-lg focus:outline-none focus:border-gray-400"
                  />
                )}
              </div>
            </div>

            <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-100">
              {modal === "edit" ? (
                <button
                  onClick={() => setDeleteConfirm(editing!.id)}
                  className="text-[12px] text-red-400 hover:text-red-600 transition-colors"
                >
                  Delete creator
                </button>
              ) : (
                <span />
              )}
              <div className="flex gap-2">
                <button
                  onClick={() => setModal(null)}
                  className="px-4 py-2 text-[13px] text-gray-600 hover:text-gray-900 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving || !form.name.trim() || !form.handle.trim()}
                  className="px-4 py-2 text-[13px] font-medium bg-gray-900 text-white rounded-lg hover:bg-gray-700 disabled:opacity-40 transition-colors"
                >
                  {saving ? "Saving…" : modal === "add" ? "Add Creator" : "Save Changes"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirmation */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 text-center">
            <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M9 7V4a1 1 0 011-1h4a1 1 0 011 1v3M4 7h16" />
              </svg>
            </div>
            <h3 className="text-[15px] font-semibold text-gray-900 mb-2">Delete creator?</h3>
            <p className="text-[13px] text-gray-500 mb-6">
              This will permanently remove <strong>{editing?.name}</strong> from the roster.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 px-4 py-2 text-[13px] border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                className="flex-1 px-4 py-2 text-[13px] font-medium bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
      <Footer />
    </>
  );
}
