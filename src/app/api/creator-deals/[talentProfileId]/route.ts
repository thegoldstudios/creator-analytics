import { NextRequest, NextResponse } from "next/server";
import { getCreatorDealsByProfileId } from "@/lib/creator-deals";

export const revalidate = 3600;

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ talentProfileId: string }> }
) {
  const { talentProfileId } = await params;
  try {
    const deals = await getCreatorDealsByProfileId(talentProfileId);
    return NextResponse.json(deals);
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
