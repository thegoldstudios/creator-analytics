import { notFound } from "next/navigation";
import { CREATORS } from "@/lib/mock-data";
import CreatorDashboard from "@/components/CreatorDashboard";

export default async function CreatorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const creator = CREATORS.find((c) => c.id === id);
  if (!creator) notFound();

  return <CreatorDashboard creator={creator} />;
}
