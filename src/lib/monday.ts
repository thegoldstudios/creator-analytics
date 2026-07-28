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
  dealValue: number; // raw value
  convertedValueGBP: number; // formula-converted £
  platforms: string[];
  wonDate: string | null;
  dealType: string;
  talentCut: number;
  tgsCut: number;
}

function parseNum(text: string | null): number {
  if (!text) return 0;
  const n = parseFloat(text.replace(/[^0-9.-]/g, ""));
  return isNaN(n) ? 0 : n;
}

export async function fetchAllDeals(): Promise<MondayDeal[]> {
  const token = process.env.MONDAY_API_TOKEN;
  if (!token) throw new Error("MONDAY_API_TOKEN not set");

  const query = `
    query {
      boards(ids: [${BOARD_ID}]) {
        items_page(limit: 500) {
          items {
            id
            name
            relative_link
            group { id title }
            column_values(ids: [
              "board_relation_mm0zyhyb",
              "deal_stage",
              "numeric_mkxn9km7",
              "formula_mm3ccg5x",
              "dropdown_mky8d1kf",
              "date_mky8cdtj",
              "color_mkth7qj",
              "formula_mm3jf9q2",
              "formula_mm3j815q"
            ]) {
              id
              text
              value
            }
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
    next: { revalidate: 300 }, // cache 5 min
  });

  if (!res.ok) throw new Error(`Monday API error: ${res.status}`);
  const json = await res.json();

  const items = json?.data?.boards?.[0]?.items_page?.items ?? [];

  return items.map((item: Record<string, unknown>): MondayDeal => {
    const cols: Record<string, string | null> = {};
    for (const cv of (item.column_values as { id: string; text: string | null }[])) {
      cols[cv.id] = cv.text ?? null;
    }

    // Parse talent profile from board_relation value
    let talentName: string | null = null;
    let talentProfileId: string | null = null;
    try {
      const raw = (item.column_values as { id: string; value: string | null }[]).find(
        (c) => c.id === "board_relation_mm0zyhyb"
      )?.value;
      if (raw) {
        const parsed = JSON.parse(raw);
        const linked = parsed?.linkedPulseIds?.[0];
        if (linked) talentProfileId = String(linked.linkedPulseId);
      }
      // text field has the name
      talentName = cols["board_relation_mm0zyhyb"] ?? null;
    } catch {}

    const platforms = cols["dropdown_mky8d1kf"]
      ? cols["dropdown_mky8d1kf"]!.split(",").map((s) => s.trim()).filter(Boolean)
      : [];

    const dealValue = parseNum(cols["numeric_mkxn9km7"]);
    const convertedGBP = parseNum(cols["formula_mm3ccg5x"]);
    // Use converted if available, else raw value
    const effectiveValue = convertedGBP > 0 ? convertedGBP : dealValue;
    const tgsCut = parseNum(cols["formula_mm3j815q"]) || Math.round(effectiveValue * 0.2);
    const talentCut = parseNum(cols["formula_mm3jf9q2"]) || Math.round(effectiveValue * 0.8);

    return {
      id: item.id as string,
      name: item.name as string,
      url: `https://thegoldstudios-company.monday.com/boards/${BOARD_ID}/pulses/${item.id}`,
      group: item.group as { id: string; title: string },
      talentName,
      talentProfileId,
      stage: cols["deal_stage"] ?? "Unknown",
      dealValue,
      convertedValueGBP: effectiveValue,
      platforms,
      wonDate: cols["date_mky8cdtj"] ?? null,
      dealType: cols["color_mkth7qj"] ?? "",
      talentCut,
      tgsCut,
    };
  });
}

// Groups that count as "done" deals
const DONE_GROUPS = new Set(["group_mkthf2s3", "group_mkvk4h72"]); // Won + Campaign Complete

export function isWon(deal: MondayDeal) {
  return DONE_GROUPS.has(deal.group.id);
}

export function isActive(deal: MondayDeal) {
  return deal.group.id === "topics"; // Active Leads
}
