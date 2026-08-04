import { NextResponse } from "next/server";
import { fetchAllDeals, fetchTalentProfiles, isWon, isOngoing, isActive, ALLOWED_TALENT_GROUPS } from "@/lib/monday";
import { getAllCreators } from "@/lib/creators-store";

export const maxDuration = 60;

function norm(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]/g, "");
}

export async function GET() {
  try {
    const [deals, profiles, creators] = await Promise.all([
      fetchAllDeals(),
      fetchTalentProfiles(),
      getAllCreators(),
    ]);

    const creatorByNorm: Record<string, { id: string; photoUrl?: string; avatar: string }> = {};
    for (const c of creators) {
      creatorByNorm[norm(c.name)] = { id: c.id, photoUrl: c.photoUrl, avatar: c.avatar };
    }
    function matchCreator(name: string) {
      const n = norm(name);
      for (const [key, val] of Object.entries(creatorByNorm)) {
        if (key.includes(n) || n.includes(key)) return val;
      }
      return null;
    }

    const dealsByProfile: Record<string, { totalDeals: number; totalRevenue: number; tgsRevenue: number; activeDeals: number; ongoingDeals: number }> = {};
    for (const deal of deals) {
      const keys = deal.allTalentProfileIds.length > 0 ? deal.allTalentProfileIds : (deal.talentProfileId ? [deal.talentProfileId] : []);
      for (const key of keys) {
        if (!dealsByProfile[key]) dealsByProfile[key] = { totalDeals: 0, totalRevenue: 0, tgsRevenue: 0, activeDeals: 0, ongoingDeals: 0 };
        if (isWon(deal)) { dealsByProfile[key].totalDeals++; dealsByProfile[key].totalRevenue += deal.dealValue; dealsByProfile[key].tgsRevenue += deal.tgsCut; }
        if (isOngoing(deal)) dealsByProfile[key].ongoingDeals++;
        if (isActive(deal)) dealsByProfile[key].activeDeals++;
      }
    }

    const summaries = profiles
      .filter((p) => ALLOWED_TALENT_GROUPS.has(p.group.toLowerCase()))
      .map((p) => {
        const d = dealsByProfile[p.id] ?? { totalDeals: 0, totalRevenue: 0, tgsRevenue: 0, activeDeals: 0, ongoingDeals: 0 };
        const match = matchCreator(p.name);
        return {
          talentProfileId: p.id,
          talentName: p.name,
          totalDeals: d.totalDeals,
          totalRevenue: d.totalRevenue,
          avgDealSize: d.totalDeals > 0 ? Math.round(d.totalRevenue / d.totalDeals) : 0,
          tgsRevenue: d.tgsRevenue,
          activeDeals: d.activeDeals,
          ongoingDeals: d.ongoingDeals,
          agent: p.agent ?? null,
          talentStatus: p.status,
          creatorId: match?.id ?? null,
          photoUrl: match?.photoUrl ?? null,
          avatar: match?.avatar ?? null,
        };
      })
      .sort((a, b) => b.totalRevenue - a.totalRevenue || b.activeDeals - a.activeDeals);

    return NextResponse.json(summaries);
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
