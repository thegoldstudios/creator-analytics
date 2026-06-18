import { notFound } from "next/navigation";
import { CREATORS } from "@/lib/mock-data";
import CreatorDashboard from "@/components/CreatorDashboard";

export default async function SharePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const creator = CREATORS.find((c) => c.shareToken === token);
  if (!creator) notFound();

  return <CreatorDashboard creator={creator} isShare />;
}
