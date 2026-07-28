import { notFound } from "next/navigation";
import { getCreatorById } from "@/lib/creators-store";
import CreatorRevenueBoard from "@/components/CreatorRevenueBoard";

export default async function CreatorRevenuePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const creator = await getCreatorById(id);
  if (!creator) notFound();

  return <CreatorRevenueBoard creator={creator} />;
}
