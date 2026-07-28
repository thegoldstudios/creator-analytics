export const dynamic = "force-dynamic";

import { fetchAllDeals, fetchTalentProfiles, isWon, isActive, MondayDeal } from "@/lib/monday";
import { getAllCreators } from "@/lib/creators-store";
import { Agent } from "@/lib/types";
import RevenueDashboard, { CreatorRevSummary } from "@/components/RevenueDashboard";

function norm(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]/g, "");
}

export default async function RevenuePage() {
  let deals: MondayDeal[] = [];
  let error: string | null = null;

  // Fetch deals and talent profiles in parallel
  const [dealsResult, profilesResult, creatorsResult] = await Promise.allSettled([
    fetchAllDeals(),
    fetchTalentProfiles(),
    getAllCreators(),
  ]);

  if (dealsResult.status === "fulfilled") deals = dealsResult.value;
  else error = dealsResult.reason instanceof Error ? dealsResult.reason.message : "Failed to load deals";

  // Build talent profile map: id → { agent, status }
  const profileMap: Record<string, { agent: string | null; status: string | null }> = {};
  if (profilesResult.status === "fulfilled") {
    for (const p of profilesResult.value) {
      profileMap[p.id] = { agent: p.agent, status: p.status };
    }
  }

  // Build creator map for photos: norm(name) → { id, photoUrl, avatar }
  const creatorByNorm: Record<string, { id: string; photoUrl?: string; avatar: string }> = {};
  if (creatorsResult.status === "fulfilled") {
    for (const c of creatorsResult.value) {
      creatorByNorm[norm(c.name)] = { id: c.id, photoUrl: c.photoUrl, avatar: c.avatar };
    }
  }

  function matchCreator(talentName: string | null) {
    if (!talentName) return null;
    const n = norm(talentName);
    for (const [key, val] of Object.entries(creatorByNorm)) {
      if (key.includes(n) || n.includes(key)) return val;
    }
    return null;
  }

  const byTalent: Record<string, CreatorRevSummary> = {};

  for (const deal of deals) {
    const key = deal.talentProfileId ?? deal.talentName ?? "";
    if (!key) continue;

    if (!byTalent[key]) {
      const profile = deal.talentProfileId ? profileMap[deal.talentProfileId] : null;
      const match = matchCreator(deal.talentName);
      byTalent[key] = {
        talentProfileId: key,
        talentName: deal.talentName ?? "Unknown",
        totalDeals: 0,
        totalRevenue: 0,
        avgDealSize: 0,
        tgsRevenue: 0,
        activeDeals: 0,
        // Agent comes from Monday Talent Profiles board — authoritative
        agent: (profile?.agent ?? null) as Agent | null,
        talentStatus: profile?.status ?? null,
        creatorId: match?.id ?? null,
        photoUrl: match?.photoUrl ?? null,
        avatar: match?.avatar ?? null,
      };
    }

    if (isWon(deal)) {
      byTalent[key].totalDeals++;
      byTalent[key].totalRevenue += deal.dealValue;
      byTalent[key].tgsRevenue += deal.tgsCut;
    }
    if (isActive(deal)) {
      byTalent[key].activeDeals++;
    }
  }

  const summaries: CreatorRevSummary[] = Object.values(byTalent)
    .map((s) => ({ ...s, avgDealSize: s.totalDeals > 0 ? Math.round(s.totalRevenue / s.totalDeals) : 0 }))
    .sort((a, b) => b.totalRevenue - a.totalRevenue || b.activeDeals - a.activeDeals);

  return <RevenueDashboard summaries={summaries} error={error} />;
}
