export const revalidate = 3600; // cache for 5 minutes at the edge

import { notFound } from "next/navigation";
import { getCreatorById } from "@/lib/creators-store";
import { getCreatorDeals } from "@/lib/creator-deals";
import CreatorRevenueBoard from "@/components/CreatorRevenueBoard";

export default async function CreatorRevenuePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const creator = await getCreatorById(id);
  if (!creator) notFound();

  let deals = null;
  try {
    deals = await getCreatorDeals(creator.name);
  } catch {
    // renders with null; board shows error state
  }

  return <CreatorRevenueBoard creator={creator} initialDeals={deals} />;
}
