import { fetchAllDeals, isWon, isActive, fmt, MondayDeal } from "@/lib/monday";
import { getAllCreators } from "@/lib/creators-store";
import { Agent } from "@/lib/types";
import RevenueDashboard, { CreatorRevSummary } from "@/components/RevenueDashboard";

function norm(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]/g, "");
}

export default async function RevenuePage() {
  let deals: MondayDeal[] = [];
  let error: string | null = null;

  try {
    deals = await fetchAllDeals();
  } catch (e) {
    error = e instanceof Error ? e.message : "Failed to load";
  }

  const creators = await getAllCreators();
  // Map: normalised creator name → { id, agent }
  const creatorByNorm: Record<string, { id: string; agent: Agent }> = {};
  for (const c of creators) {
    creatorByNorm[norm(c.name)] = { id: c.id, agent: c.agent };
  }

  function matchCreator(talentName: string | null): { id: string; agent: Agent } | null {
    if (!talentName) return null;
    const n = norm(talentName);
    for (const [key, val] of Object.entries(creatorByNorm)) {
      if (key.includes(n) || n.includes(key)) return val;
    }
    return null;
  }

  // Aggregate by talent profile
  const byTalent: Record<string, CreatorRevSummary> = {};
  for (const deal of deals) {
    const key = deal.talentProfileId ?? deal.talentName ?? "";
    if (!key) continue;
    if (!byTalent[key]) {
      const match = matchCreator(deal.talentName);
      byTalent[key] = {
        talentProfileId: key,
        talentName: deal.talentName ?? "Unknown",
        totalDeals: 0,
        totalRevenue: 0,
        avgDealSize: 0,
        tgsRevenue: 0,
        activeDeals: 0,
        creatorId: match?.id ?? null,
        agent: match?.agent ?? null,
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

  const wonDeals = deals.filter(isWon);
  const totalRevenue = wonDeals.reduce((s, d) => s + d.dealValue, 0);
  const totalDeals = wonDeals.length;
  const avgDealSize = totalDeals > 0 ? Math.round(totalRevenue / totalDeals) : 0;
  const tgsRevenue = wonDeals.reduce((s, d) => s + d.tgsCut, 0);
  const activeCount = deals.filter(isActive).length;

  return (
    <RevenueDashboard
      summaries={summaries}
      stats={{ totalDeals, totalRevenue: fmt(totalRevenue), avgDealSize: fmt(avgDealSize), tgsRevenue: fmt(tgsRevenue), activeCount }}
      error={error}
    />
  );
}
