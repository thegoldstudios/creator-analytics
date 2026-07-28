import { NextRequest, NextResponse } from "next/server";
import { fetchAllDeals, isWon, isActive } from "@/lib/monday";

// Normalise a creator name for fuzzy matching
function norm(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]/g, "");
}

export async function GET(req: NextRequest) {
  const talentName = req.nextUrl.searchParams.get("talentName");
  if (!talentName) return NextResponse.json({ error: "Missing talentName" }, { status: 400 });

  try {
    const all = await fetchAllDeals();
    const normTarget = norm(talentName);

    // Match by normalised name — Monday name contains our name or vice versa
    const deals = all.filter((d) => {
      if (!d.talentName) return false;
      const n = norm(d.talentName);
      return n.includes(normTarget) || normTarget.includes(n);
    });

    const wonDeals = deals.filter(isWon);
    const activeDeals = deals.filter(isActive);

    const totalDeals = wonDeals.length;
    const totalRevenue = wonDeals.reduce((s, d) => s + d.dealValue, 0);
    const avgDealSize = totalDeals > 0 ? Math.round(totalRevenue / totalDeals) : 0;
    const tgsRevenue = wonDeals.reduce((s, d) => s + d.tgsCut, 0);

    // Platform distribution (won deals)
    const platformCounts: Record<string, number> = {};
    for (const d of wonDeals) {
      for (const p of d.platforms) {
        platformCounts[p] = (platformCounts[p] ?? 0) + 1;
      }
    }

    // Stage distribution (all deals)
    const stageCounts: Record<string, number> = {};
    for (const d of deals) {
      stageCounts[d.stage] = (stageCounts[d.stage] ?? 0) + 1;
    }

    // Revenue by period (for bar chart — won deals with wonDate)
    const revenueByMonth: Record<string, { talentCut: number; tgsCut: number }> = {};
    const revenueByQuarter: Record<string, { talentCut: number; tgsCut: number }> = {};
    const revenueByYear: Record<string, { talentCut: number; tgsCut: number }> = {};
    const revenueByWeek: Record<string, { talentCut: number; tgsCut: number }> = {};

    for (const d of wonDeals) {
      if (!d.wonDate) continue;
      const date = new Date(d.wonDate);
      const month = d.wonDate.slice(0, 7);
      const year = d.wonDate.slice(0, 4);
      const q = `${year} Q${Math.ceil((date.getMonth() + 1) / 3)}`;

      // ISO week
      const startOfYear = new Date(date.getFullYear(), 0, 1);
      const week = Math.ceil(((date.getTime() - startOfYear.getTime()) / 86400000 + startOfYear.getDay() + 1) / 7);
      const weekKey = `${year}-W${String(week).padStart(2, "0")}`;

      for (const [key, map] of [
        [month, revenueByMonth],
        [year, revenueByYear],
        [q, revenueByQuarter],
        [weekKey, revenueByWeek],
      ] as [string, Record<string, { talentCut: number; tgsCut: number }>][]) {
        if (!map[key]) map[key] = { talentCut: 0, tgsCut: 0 };
        map[key].talentCut += d.talentCut;
        map[key].tgsCut += d.tgsCut;
      }
    }

    return NextResponse.json({
      totalDeals,
      totalRevenue: Math.round(totalRevenue),
      avgDealSize,
      tgsRevenue: Math.round(tgsRevenue),
      platformCounts,
      stageCounts,
      revenueByMonth,
      revenueByQuarter,
      revenueByYear,
      revenueByWeek,
      activeDeals: activeDeals.map((d) => ({
        id: d.id,
        name: d.name,
        url: d.url,
        stage: d.stage,
        dealValue: d.dealValue,
        platforms: d.platforms,
        dealType: d.dealType,
        group: d.group.title,
      })),
      wonDeals: wonDeals.map((d) => ({
        id: d.id,
        name: d.name,
        url: d.url,
        stage: d.stage,
        dealValue: d.dealValue,
        platforms: d.platforms,
        dealType: d.dealType,
        wonDate: d.wonDate,
        group: d.group.title,
      })),
    }, { headers: { "Cache-Control": "s-maxage=300, stale-while-revalidate=600" } });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
