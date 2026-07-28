import { fetchAllDeals, isWon, isActive } from "@/lib/monday";

function norm(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]/g, "");
}

export interface RevenueSlice { talentCut: number; tgsCut: number }

export interface DealItem {
  id: string;
  name: string;
  url: string;
  stage: string;
  dealValue: number;
  platforms: string[];
  dealType: string;
  wonDate?: string;
  group: string;
}

export interface CreatorDeals {
  totalDeals: number;
  totalRevenue: number;
  avgDealSize: number;
  tgsRevenue: number;
  platformCounts: Record<string, number>;
  stageCounts: Record<string, number>;
  revenueByMonth: Record<string, RevenueSlice>;
  revenueByQuarter: Record<string, RevenueSlice>;
  revenueByYear: Record<string, RevenueSlice>;
  revenueByWeek: Record<string, RevenueSlice>;
  activeDeals: DealItem[];
  wonDeals: DealItem[];
}

export async function getCreatorDeals(talentName: string): Promise<CreatorDeals> {
  const all = await fetchAllDeals();
  const normTarget = norm(talentName);

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

  const platformCounts: Record<string, number> = {};
  for (const d of wonDeals) {
    for (const p of d.platforms) {
      platformCounts[p] = (platformCounts[p] ?? 0) + 1;
    }
  }

  const stageCounts: Record<string, number> = {};
  for (const d of deals) {
    stageCounts[d.stage] = (stageCounts[d.stage] ?? 0) + 1;
  }

  const revenueByMonth: Record<string, RevenueSlice> = {};
  const revenueByQuarter: Record<string, RevenueSlice> = {};
  const revenueByYear: Record<string, RevenueSlice> = {};
  const revenueByWeek: Record<string, RevenueSlice> = {};

  for (const d of wonDeals) {
    if (!d.wonDate) continue;
    const date = new Date(d.wonDate);
    const month = d.wonDate.slice(0, 7);
    const year = d.wonDate.slice(0, 4);
    const q = `${year} Q${Math.ceil((date.getMonth() + 1) / 3)}`;
    const startOfYear = new Date(date.getFullYear(), 0, 1);
    const week = Math.ceil(((date.getTime() - startOfYear.getTime()) / 86400000 + startOfYear.getDay() + 1) / 7);
    const weekKey = `${year}-W${String(week).padStart(2, "0")}`;

    for (const [key, map] of [
      [month, revenueByMonth],
      [year, revenueByYear],
      [q, revenueByQuarter],
      [weekKey, revenueByWeek],
    ] as [string, Record<string, RevenueSlice>][]) {
      if (!map[key]) map[key] = { talentCut: 0, tgsCut: 0 };
      map[key].talentCut += d.talentCut;
      map[key].tgsCut += d.tgsCut;
    }
  }

  return {
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
      id: d.id, name: d.name, url: d.url, stage: d.stage,
      dealValue: d.dealValue, platforms: d.platforms, dealType: d.dealType,
      group: d.group.title,
    })),
    wonDeals: wonDeals.map((d) => ({
      id: d.id, name: d.name, url: d.url, stage: d.stage,
      dealValue: d.dealValue, platforms: d.platforms, dealType: d.dealType,
      wonDate: d.wonDate ?? undefined, group: d.group.title,
    })),
  };
}
