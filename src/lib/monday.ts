import { unstable_cache } from "next/cache";

const MONDAY_API = "https://api.monday.com/v2";
const BOARD_ID = 2084113525;

export interface MondayDeal {
  id: string;
  name: string;
  url: string;
  group: { id: string; title: string };
  talentName: string | null;
  talentProfileId: string | null;
  // All talent profiles linked to this deal (some deals link multiple creators)
  allTalentProfileIds: string[];
  stage: string;
  dealValue: number; // always GBP
  currency: string;  // original currency from Monday
  dealValueRaw: number; // original amount before conversion
  platforms: string[];
  wonDate: string | null;
  dealType: string;
  talentCut: number;
  tgsCut: number;
}

// Stages that represent a genuine active pipeline (not mass outreach or dead)
export const ACTIVE_STAGES = new Set([
  "negotiation",
  "contracts and agreements",
  "proposal sent",
  "gifted",
]);

function parseNum(text: string | null | undefined): number {
  if (!text) return 0;
  const n = parseFloat(text.replace(/[^0-9.-]/g, ""));
  return isNaN(n) ? 0 : n;
}

// Fetch live GBP exchange rates from open.er-api.com (free, no key needed)
// Returns rates relative to GBP: rates["USD"] = 1.27 means £1 = $1.27
async function _fetchExchangeRates(): Promise<Record<string, number>> {
  try {
    const res = await fetch("https://open.er-api.com/v6/latest/GBP", {
      cache: "no-store",
    });
    if (!res.ok) throw new Error(`Exchange rate API ${res.status}`);
    const json = await res.json();
    return (json.rates as Record<string, number>) ?? {};
  } catch {
    // Fallback rates if API is unavailable
    return { GBP: 1, USD: 1.27, EUR: 1.17, CAD: 1.72, AUD: 1.96 };
  }
}

// Cache exchange rates for 1 hour
export const fetchExchangeRates = unstable_cache(
  _fetchExchangeRates,
  ["exchange-rates-gbp"],
  { revalidate: 3600 }
);

function toGBP(amount: number, currency: string, rates: Record<string, number>): number {
  if (!amount) return 0;
  const cur = currency.trim().toUpperCase();
  if (!cur || cur === "GBP" || cur === "PICK CURRENCY") return amount;
  const rate = rates[cur];
  if (!rate) return amount; // unknown currency — return as-is
  return Math.round((amount / rate) * 100) / 100;
}

async function _fetchAllDeals(): Promise<MondayDeal[]> {
  const token = process.env.MONDAY_API_TOKEN;
  if (!token) throw new Error("MONDAY_API_TOKEN not set");

  // Fetch exchange rates in parallel with Monday data
  const ratesPromise = fetchExchangeRates();

  const COLS = `["board_relation_mm0zyhyb","deal_stage","numeric_mkxn9km7","color_mm2f2s8s","formula_mm3j815q","formula_mm3jf9q2","dropdown_mky8d1kf","date_mky8cdtj","color_mkth7qj"]`;
  const ITEM_FRAGMENT = `
    id name
    group { id title }
    column_values(ids: ${COLS}) {
      id text value
      ... on BoardRelationValue { linked_items { id name } }
    }
  `;

  // Initial fetch: Won, Campaign Complete, and Active Leads groups
  const initialQuery = `
    query {
      boards(ids: [${BOARD_ID}]) {
        groups(ids: ["group_mkthf2s3","group_mkvk4h72","topics"]) {
          id title
          items_page(limit: 500) {
            cursor
            items { ${ITEM_FRAGMENT} }
          }
        }
      }
    }
  `;

  const [initialRes, rates] = await Promise.all([
    fetch(MONDAY_API, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: token },
      body: JSON.stringify({ query: initialQuery }),
      cache: "no-store",
    }),
    ratesPromise,
  ]);

  if (!initialRes.ok) throw new Error(`Monday API ${initialRes.status}`);
  const initialJson = await initialRes.json();
  if (initialJson.errors) throw new Error(initialJson.errors[0]?.message ?? "Monday GraphQL error");

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const initialGroups: any[] = initialJson?.data?.boards?.[0]?.groups ?? [];
  console.log("[monday] groups fetched:", initialGroups.map((g: any) => `${g.title}(${g.id}): ${g.items_page.items.length} items, cursor=${!!g.items_page.cursor}`));

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const allItems: any[] = initialGroups.flatMap((g: any) => g.items_page.items);

  // Follow pagination cursors for groups with >500 items
  const cursorFollows = initialGroups
    .filter((g: any) => g.items_page.cursor)
    .map((g: any) =>
      (async () => {
        let cursor: string | null = g.items_page.cursor;
        let count = g.items_page.items.length;
        while (cursor) {
          const nextQuery = `
            query {
              next_items_page(limit: 500, cursor: "${cursor}") {
                cursor
                items { ${ITEM_FRAGMENT} }
              }
            }
          `;
          const nextRes = await fetch(MONDAY_API, {
            method: "POST",
            headers: { "Content-Type": "application/json", Authorization: token },
            body: JSON.stringify({ query: nextQuery }),
            cache: "no-store",
          });
          if (!nextRes.ok) break;
          const nextJson = await nextRes.json();
          if (nextJson.errors) break;
          const page = nextJson?.data?.next_items_page;
          const pageItems = page?.items ?? [];
          allItems.push(...pageItems);
          count += pageItems.length;
          cursor = page?.cursor ?? null;
        }
        console.log(`[monday] pagination done for ${g.title}: ${count} total items`);
      })()
    );

  await Promise.all(cursorFollows);
  console.log("[monday] total items after pagination:", allItems.length);

  const items = allItems;

  return items.map((item): MondayDeal => {
    const cols: Record<string, { text: string | null; value: string | null; linked_items?: { id: string; name: string }[] }> = {};
    for (const cv of item.column_values as { id: string; text: string | null; value: string | null; linked_items?: { id: string; name: string }[] }[]) {
      cols[cv.id] = cv;
    }

    const linkedItems = cols["board_relation_mm0zyhyb"]?.linked_items ?? [];
    const talentLinked = linkedItems[0] ?? null;
    const talentName = talentLinked?.name ?? null;
    const talentProfileId = talentLinked?.id ?? null;
    const allTalentProfileIds = linkedItems.map((li) => li.id);

    const platforms = cols["dropdown_mky8d1kf"]?.text
      ? cols["dropdown_mky8d1kf"]!.text!.split(",").map((s) => s.trim()).filter(Boolean)
      : [];

    const currency = cols["color_mm2f2s8s"]?.text ?? "GBP";
    const dealValueRaw = parseNum(cols["numeric_mkxn9km7"]?.text);
    const dealValue = toGBP(dealValueRaw, currency, rates);

    const tgsCut = parseNum(cols["formula_mm3j815q"]?.text) || Math.round(dealValue * 0.2);
    const talentCut = parseNum(cols["formula_mm3jf9q2"]?.text) || Math.round(dealValue * 0.8);

    return {
      id: item.id as string,
      name: item.name as string,
      url: `https://thegoldstudios-company.monday.com/boards/${BOARD_ID}/pulses/${item.id}`,
      group: item.group as { id: string; title: string },
      talentName,
      talentProfileId,
      allTalentProfileIds,
      stage: cols["deal_stage"]?.text ?? "Unknown",
      dealValue,
      currency,
      dealValueRaw,
      platforms,
      wonDate: cols["date_mky8cdtj"]?.text ?? null,
      dealType: cols["color_mkth7qj"]?.text ?? "",
      talentCut,
      tgsCut,
    };
  });
}

// Cache Monday data for 5 minutes
export const fetchAllDeals = unstable_cache(_fetchAllDeals, ["monday-deals-v11"], { revalidate: 300 });

const TALENT_BOARD_ID = 2110287888;

const AGENT_MAP: Record<string, string> = {
  "Maddie Warn": "Maddie",
  "Elicia Jones": "Elicia",
  "Olivia Scenna": "Olivia",
  "Seth Klein": "Seth",
};

function parseAgent(text: string | null): string | null {
  if (!text) return null;
  for (const [full, short] of Object.entries(AGENT_MAP)) {
    if (text.includes(full)) return short;
  }
  return null;
}

export interface TalentProfile {
  id: string;
  name: string;
  group: string;
  agent: string | null;
  status: string | null;
}

export const ALLOWED_TALENT_GROUPS = new Set([
  "gold talent uk - pod a",
  "gold talent uk - pod b",
  "gold talent us - pod a",
  "gold talent us - pod b",
  "gold arena uk",
  "gold arena us",
]);

async function _fetchTalentProfiles(): Promise<TalentProfile[]> {
  const token = process.env.MONDAY_API_TOKEN;
  if (!token) throw new Error("MONDAY_API_TOKEN not set");

  const query = `
    query {
      boards(ids: [${TALENT_BOARD_ID}]) {
        groups {
          id title
          items_page(limit: 500) {
            items {
              id name
              column_values(ids: ["multiple_person_mkv1k4m1", "color_mm4f23s4"]) {
                id text
              }
            }
          }
        }
      }
    }
  `;

  const res = await fetch(MONDAY_API, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: token },
    body: JSON.stringify({ query }),
    cache: "no-store",
  });

  if (!res.ok) throw new Error(`Monday API ${res.status}`);
  const json = await res.json();
  if (json.errors) throw new Error(json.errors[0]?.message ?? "Monday GraphQL error");

  const groups: { id: string; title: string; items_page: { items: Record<string, unknown>[] } }[] =
    json?.data?.boards?.[0]?.groups ?? [];

  const profiles: TalentProfile[] = [];
  for (const group of groups) {
    for (const item of group.items_page?.items ?? []) {
      const cols: Record<string, string | null> = {};
      for (const cv of item.column_values as { id: string; text: string | null }[]) {
        cols[cv.id] = cv.text ?? null;
      }
      const groupLower = group.title.toLowerCase();
      let agent = parseAgent(cols["multiple_person_mkv1k4m1"]);
      if (!agent && groupLower.includes("gold arena uk")) agent = "Kelvin";
      if (!agent && groupLower.includes("gold arena us")) agent = "Emerson";
      profiles.push({
        id: item.id as string,
        name: item.name as string,
        group: group.title,
        agent,
        status: cols["color_mm4f23s4"] ?? null,
      });
    }
  }
  return profiles;
}

export const fetchTalentProfiles = unstable_cache(_fetchTalentProfiles, ["monday-talent-profiles-v6"], { revalidate: 300 });

const DONE_GROUPS = new Set(["group_mkthf2s3", "group_mkvk4h72"]);

export function isWon(deal: MondayDeal) {
  return DONE_GROUPS.has(deal.group.id);
}

// Signed off but not yet posted — Won group only, excludes Campaign Complete
export function isOngoing(deal: MondayDeal) {
  return deal.group.id === "group_mkthf2s3";
}

export function isActive(deal: MondayDeal) {
  // "topics" = Active Leads group; filter by meaningful stages only (not mass outreach "New Lead")
  return deal.group.id === "topics" && ACTIVE_STAGES.has(deal.stage.toLowerCase());
}

export function fmt(n: number) {
  if (n >= 1_000_000) return `£${(n / 1_000_000).toFixed(1)}m`;
  if (n >= 1_000) return `£${(n / 1_000).toFixed(1)}k`;
  return `£${Math.round(n).toLocaleString()}`;
}
