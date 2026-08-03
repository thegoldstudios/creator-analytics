export const revalidate = 3600;

import { notFound } from "next/navigation";
import { fetchOneTalentProfile } from "@/lib/monday";
import CreatorRevenueBoard from "@/components/CreatorRevenueBoard";
import { Creator } from "@/lib/types";

export default async function TalentRevenuePage({ params }: { params: Promise<{ talentProfileId: string }> }) {
  const { talentProfileId } = await params;

  const profile = await fetchOneTalentProfile(talentProfileId);
  if (!profile) notFound();

  const creator: Creator = {
    id: "",
    name: profile.name,
    handle: "",
    avatar: profile.name.split(" ").map((w: string) => w[0]).join("").slice(0, 2).toUpperCase(),
    category: "",
    agent: (profile.agent as Creator["agent"]) ?? "Maddie",
    platforms: [],
    analytics: {},
    shareToken: "",
  };

  // Don't await deals — page renders instantly, deals load client-side
  return (
    <CreatorRevenueBoard
      creator={creator}
      talentProfileId={talentProfileId}
      initialDeals={null}
      backUrl="/revenue"
    />
  );
}
