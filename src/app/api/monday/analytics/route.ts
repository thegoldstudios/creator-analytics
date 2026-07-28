import { NextResponse } from "next/server";
import { fetchAllDeals, isWon, isActive } from "@/lib/monday";

export async function GET() {
  try {
    const deals = await fetchAllDeals();

    const wonDeals = deals.filter(isWon);
    const activeDeals = deals.filter(isActive);

    const totalDeals = wonDeals.length;
    const totalRevenue = wonDeals.reduce((s, d) => s + d.dealValue, 0);
    const avgDealSize = totalDeals > 0 ? Math.round(totalRevenue / totalDeals) : 0;
    const tgsRevenue = wonDeals.reduce((s, d) => s + d.tgsCut, 0);

    // Per-creator aggregation (all deals, not just won)
    const byCreator: Record<string, {
      talentName: string;
      totalRevenue: number;
      totalDeals: number;
      activeDeals: number;
      latestStage: string;
    }> = {};

    for (const deal of deals) {
      const key = deal.talentProfileId ?? deal.talentName ?? "__unknown";
      if (!key || key === "__unknown") continue;
      if (!byCreator[key]) {
        byCreator[key] = {
          talentName: deal.talentName ?? "Unknown",
          totalRevenue: 0,
          totalDeals: 0,
          activeDeals: 0,
          latestStage: deal.stage,
        };
      }
      if (isWon(deal)) {
        byCreator[key].totalRevenue += deal.dealValue;
        byCreator[key].totalDeals++;
      }
      if (isActive(deal)) {
        byCreator[key].activeDeals++;
        byCreator[key].latestStage = deal.stage;
      }
    }

    const creatorSummaries = Object.entries(byCreator).map(([id, c]) => ({
      mondayId: id,
      talentName: c.talentName,
      totalDeals: c.totalDeals,
      totalRevenue: c.totalRevenue,
      avgDealSize: c.totalDeals > 0 ? Math.round(c.totalRevenue / c.totalDeals) : 0,
      activeDeals: c.activeDeals,
      latestStage: c.latestStage,
    })).sort((a, b) => b.totalRevenue - a.totalRevenue);

    // Revenue over time (for all won deals with a wonDate)
    const revenueByMonth: Record<string, { talentCut: number; tgsCut: number }> = {};
    for (const deal of wonDeals) {
      if (!deal.wonDate) continue;
      const month = deal.wonDate.slice(0, 7); // YYYY-MM
      if (!revenueByMonth[month]) revenueByMonth[month] = { talentCut: 0, tgsCut: 0 };
      revenueByMonth[month].talentCut += deal.talentCut;
      revenueByMonth[month].tgsCut += deal.tgsCut;
    }

    return NextResponse.json({
      totalDeals,
      totalRevenue: Math.round(totalRevenue),
      avgDealSize,
      tgsRevenue: Math.round(tgsRevenue),
      activeCount: activeDeals.length,
      creatorSummaries,
      revenueByMonth,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
