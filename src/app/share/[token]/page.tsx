import { notFound } from "next/navigation";
import { getAllCreators } from "@/lib/creators-store";
import CreatorDashboard from "@/components/CreatorDashboard";

export default async function SharePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const all = await getAllCreators();
  const creator = all.find((c) => c.shareToken === token);
  if (!creator) notFound();

  return <CreatorDashboard creator={creator} isShare />;
}
