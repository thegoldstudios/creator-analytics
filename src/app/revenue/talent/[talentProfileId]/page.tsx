export const revalidate = 3600;

import { notFound } from "next/navigation";
import { fetchOneTalentProfile } from "@/lib/monday";
import { getCreatorDealsByProfileId } from "@/lib/creator-deals";
import CreatorRevenueBoard from "@/components/CreatorRevenueBoard";
import { Creator } from "@/lib/types";

export default async function TalentRevenuePage({ params }: { params: Promise<{ talentProfileId: string }> }) {
  const { talentProfileId } = await params;

  const [profile, deals] = await Promise.allSettled([
    fetchOneTalentProfile(talentProfileId),
    getCreatorDealsByProfileId(talentProfileId),
  ]);

  if (profile.status === "rejected" || !profile.value) notFound();

  const p = profile.value;

  const creator: Creator = {
    id: "",
    name: p.name,
    handle: "",
    avatar: p.name.split(" ").map((w: string) => w[0]).join("").slice(0, 2).toUpperCase(),
    category: "",
    agent: (p.agent as Creator["agent"]) ?? "Maddie",
    platforms: [],
    analytics: {},
    shareToken: "",
  };

  return (
    <CreatorRevenueBoard
      creator={creator}
      initialDeals={deals.status === "fulfilled" ? deals.value : null}
      backUrl="/revenue"
    />
  );
}
