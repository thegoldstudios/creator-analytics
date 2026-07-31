export const revalidate = 300; // ISR: cache full page at edge for 5 minutes

import { fetchAllDeals, fetchTalentProfiles, isWon, isActive, MondayDeal, ALLOWED_TALENT_GROUPS } from "@/lib/monday";
import { getAllCreators } from "@/lib/creators-store";
import { Agent } from "@/lib/types";
import RevenueDashboard, { CreatorRevSummary } from "@/components/RevenueDashboard";

function norm(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]/g, "");
}

export default async function RevenuePage() {
  let deals: MondayDeal[] = [];
  let error: string | null = null;

  const [dealsResult, profilesResult, creatorsResult] = await Promise.allSettled([
    fetchAllDeals(),
    fetchTalentProfiles(),
    getAllCreators(),
  ]);

  if (dealsResult.status === "fulfilled") deals = dealsResult.value;
  else error = dealsResult.reason instanceof Error ? dealsResult.reason.message : "Failed to load deals";

  const profiles = profilesResult.status === "fulfilled" ? profilesResult.value : [];
  const creators = creatorsResult.status === "fulfilled" ? creatorsResult.value : [];

  // Creator photo/avatar lookup by normalised name
  const creatorByNorm: Record<string, { id: string; photoUrl?: string; avatar: string }> = {};
  for (const c of creators) {
    creatorByNorm[norm(c.name)] = { id: c.id, photoUrl: c.photoUrl, avatar: c.avatar };
  }

  function matchCreator(talentName: string) {
    const n = norm(talentName);
    for (const [key, val] of Object.entries(creatorByNorm)) {
      if (key.includes(n) || n.includes(key)) return val;
    }
    return null;
  }

  // Aggregate deals by talent profile ID (credit ALL linked talents on multi-talent deals)
  const dealsByProfile: Record<string, { totalDeals: number; totalRevenue: number; tgsRevenue: number; activeDeals: number }> = {};
  for (const deal of deals) {
    const keys = deal.allTalentProfileIds.length > 0 ? deal.allTalentProfileIds : (deal.talentProfileId ? [deal.talentProfileId] : []);
    for (const key of keys) {
      if (!dealsByProfile[key]) dealsByProfile[key] = { totalDeals: 0, totalRevenue: 0, tgsRevenue: 0, activeDeals: 0 };
      if (isWon(deal)) {
        dealsByProfile[key].totalDeals++;
        dealsByProfile[key].totalRevenue += deal.dealValue;
        dealsByProfile[key].tgsRevenue += deal.tgsCut;
      }
      if (isActive(deal)) {
        dealsByProfile[key].activeDeals++;
      }
    }
  }

  // Build summaries from talent profiles, excluding unwanted groups
  const summaries: CreatorRevSummary[] = profiles
    .filter((p) => ALLOWED_TALENT_GROUPS.has(p.group.toLowerCase()))
    .map((p): CreatorRevSummary => {
      const d = dealsByProfile[p.id] ?? { totalDeals: 0, totalRevenue: 0, tgsRevenue: 0, activeDeals: 0 };
      const match = matchCreator(p.name);
      return {
        talentProfileId: p.id,
        talentName: p.name,
        totalDeals: d.totalDeals,
        totalRevenue: d.totalRevenue,
        avgDealSize: d.totalDeals > 0 ? Math.round(d.totalRevenue / d.totalDeals) : 0,
        tgsRevenue: d.tgsRevenue,
        activeDeals: d.activeDeals,
        agent: p.agent as Agent | null,
        talentStatus: p.status,
        creatorId: match?.id ?? null,
        // Prefer photo from Monday social links; fall back to KV store
        photoUrl: p.photoUrl ?? match?.photoUrl ?? null,
        avatar: match?.avatar ?? null,
      };
    })
    .sort((a, b) => b.totalRevenue - a.totalRevenue || b.activeDeals - a.activeDeals);

  return <RevenueDashboard summaries={summaries} error={error} />;
}
