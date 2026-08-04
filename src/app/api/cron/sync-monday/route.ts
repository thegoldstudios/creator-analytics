import { NextRequest, NextResponse } from "next/server";
import { syncDealsToKV, syncProfilesToKV } from "@/lib/monday";

export const maxDuration = 60;

export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const auth = req.headers.get("authorization");
    if (auth !== `Bearer ${secret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  const [deals, profiles] = await Promise.allSettled([
    syncDealsToKV(),
    syncProfilesToKV(),
  ]);

  return NextResponse.json({
    ok: true,
    deals: deals.status === "fulfilled" ? deals.value.length : `error: ${deals.reason}`,
    profiles: profiles.status === "fulfilled" ? profiles.value.length : `error: ${profiles.reason}`,
  });
}
