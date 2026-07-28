const MONDAY_API = "https://api.monday.com/v2";
const BOARD_ID = 2084113525;

export interface MondayDeal {
  id: string;
  name: string;
  url: string;
  group: { id: string; title: string };
  talentName: string | null;
  talentProfileId: string | null;
  stage: string;
  priority: string | null;
  dealValue: number;
  platforms: string[];
  wonDate: string | null;
  dealType: string;
  talentCut: number;
  tgsCut: number;
}

function parseNum(text: string | null | undefined): number {
  if (!text) return 0;
  const n = parseFloat(text.replace(/[^0-9.-]/g, ""));
  return isNaN(n) ? 0 : n;
}

export async function fetchAllDeals(): Promise<MondayDeal[]> {
  const token = process.env.MONDAY_API_TOKEN;
  if (!token) throw new Error("MONDAY_API_TOKEN not set");

  // Query specific groups so we don't miss Won/Campaign Complete items
  // (global items_page limit can cut off items in later groups)
  const COLS = `["board_relation_mm0zyhyb","deal_stage","numeric_mkxn9km7","formula_mm3j815q","formula_mm3jf9q2","dropdown_mky8d1kf","date_mky8cdtj","color_mkth7qj","status9"]`;
  const ITEM_FRAGMENT = `
    id name
    group { id title }
    column_values(ids: ${COLS}) {
      id text value
      ... on BoardRelationValue { linked_items { id name } }
    }
  `;
  const query = `
    query {
      boards(ids: [${BOARD_ID}]) {
        groups(ids: ["group_mkthf2s3","group_mkvk4h72","topics","closed","group_mktmffqg"]) {
          id title
          items_page(limit: 500) {
            items { ${ITEM_FRAGMENT} }
          }
        }
      }
    }
  `;

  const res = await fetch(MONDAY_API, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: token,
    },
    body: JSON.stringify({ query }),
    cache: "no-store",
  });

  if (!res.ok) throw new Error(`Monday API ${res.status}`);
  const json = await res.json();
  if (json.errors) throw new Error(json.errors[0]?.message ?? "Monday GraphQL error");

  // Flatten items from all groups
  const groups: { items_page: { items: Record<string, unknown>[] } }[] =
    json?.data?.boards?.[0]?.groups ?? [];
  const items: Record<string, unknown>[] = groups.flatMap((g) => g.items_page?.items ?? []);

  return items.map((item): MondayDeal => {
    // Index column values by id
    const cols: Record<string, { text: string | null; value: string | null; linked_items?: { id: string; name: string }[] }> = {};
    for (const cv of item.column_values as { id: string; text: string | null; value: string | null; linked_items?: { id: string; name: string }[] }[]) {
      cols[cv.id] = cv;
    }

    const talentLinked = cols["board_relation_mm0zyhyb"]?.linked_items?.[0] ?? null;
    const talentName = talentLinked?.name ?? null;
    const talentProfileId = talentLinked?.id ?? null;

    const platforms = cols["dropdown_mky8d1kf"]?.text
      ? cols["dropdown_mky8d1kf"]!.text!.split(",").map((s) => s.trim()).filter(Boolean)
      : [];

    const dealValue = parseNum(cols["numeric_mkxn9km7"]?.text);
    const tgsCut = parseNum(cols["formula_mm3j815q"]?.text) || Math.round(dealValue * 0.2);
    const talentCut = parseNum(cols["formula_mm3jf9q2"]?.text) || Math.round(dealValue * 0.8);

    return {
      id: item.id as string,
      name: item.name as string,
      url: `https://thegoldstudios-company.monday.com/boards/${BOARD_ID}/pulses/${item.id}`,
      group: item.group as { id: string; title: string },
      talentName,
      talentProfileId,
      stage: cols["deal_stage"]?.text ?? "Unknown",
      priority: cols["status9"]?.text || null,
      dealValue,
      platforms,
      wonDate: cols["date_mky8cdtj"]?.text ?? null,
      dealType: cols["color_mkth7qj"]?.text ?? "",
      talentCut,
      tgsCut,
    };
  });
}

// Groups that count as completed/won deals
const DONE_GROUPS = new Set(["group_mkthf2s3", "group_mkvk4h72"]); // Won + Campaign Complete

export function isWon(deal: MondayDeal) {
  return DONE_GROUPS.has(deal.group.id);
}

export function isActive(deal: MondayDeal) {
  return deal.group.id === "topics"; // Active Leads
}

export function fmt(n: number) {
  if (n >= 1_000_000) return `£${(n / 1_000_000).toFixed(1)}m`;
  if (n >= 1_000) return `£${(n / 1_000).toFixed(1)}k`;
  return `£${Math.round(n).toLocaleString()}`;
}
