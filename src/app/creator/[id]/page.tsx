import { notFound } from "next/navigation";
import { getCreatorById } from "@/lib/creators-store";
import CreatorDashboard from "@/components/CreatorDashboard";

export default async function CreatorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const creator = await getCreatorById(id);
  if (!creator) notFound();

  return <CreatorDashboard creator={creator} />;
}
