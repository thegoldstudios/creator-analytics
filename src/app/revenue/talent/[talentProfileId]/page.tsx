export const revalidate = 300;
export const dynamicParams = false; // 404 any ID not in generateStaticParams

import { notFound } from "next/navigation";
import { fetchTalentProfiles } from "@/lib/monday";
import { getCreatorDealsByProfileId } from "@/lib/creator-deals";
import { getAllCreators } from "@/lib/creators-store";
import CreatorRevenueBoard from "@/components/CreatorRevenueBoard";
import { Creator } from "@/lib/types";

function norm(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]/g, "");
}

// Pre-render every creator page at build time so no user ever hits a cold fetch
export async function generateStaticParams() {
  const profiles = await fetchTalentProfiles();
  return profiles.map((p) => ({ talentProfileId: p.id }));
}

export default async function TalentRevenuePage({ params }: { params: Promise<{ talentProfileId: string }> }) {
  const { talentProfileId } = await params;

  const [profiles, creators] = await Promise.all([
    fetchTalentProfiles(),
    getAllCreators(),
  ]);

  const profile = profiles.find((p) => p.id === talentProfileId);
  if (!profile) notFound();

  // Try to find matching creator in KV store for photo/avatar
  const n = norm(profile.name);
  const match = creators.find((c) => {
    const cn = norm(c.name);
    return cn.includes(n) || n.includes(cn);
  });

  // Build a minimal Creator-like object — only name, photo, and id are used by CreatorRevenueBoard
  const creator: Creator = match ?? {
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

  let deals = null;
  try {
    deals = await getCreatorDealsByProfileId(talentProfileId);
  } catch {
    // renders with null; board shows error state
  }

  return <CreatorRevenueBoard creator={creator} initialDeals={deals} backUrl="/revenue" />;
}
