import { kv } from "@vercel/kv";
import { CREATORS } from "./mock-data";
import { Creator } from "./types";

const KEY = "creators:v1";

export async function getAllCreators(): Promise<Creator[]> {
  try {
    const data = await kv.get<Creator[]>(KEY);
    if (data && data.length > 0) return data;
  } catch {
    // KV unavailable — fall back to mock data
  }
  return CREATORS;
}

export async function saveAllCreators(creators: Creator[]): Promise<void> {
  await kv.set(KEY, creators);
}

export async function getCreatorById(id: string): Promise<Creator | null> {
  const all = await getAllCreators();
  return all.find((c) => c.id === id) ?? null;
}

export async function upsertCreator(creator: Creator): Promise<void> {
  const all = await getAllCreators();
  const idx = all.findIndex((c) => c.id === creator.id);
  if (idx >= 0) {
    all[idx] = creator;
  } else {
    all.push(creator);
  }
  await saveAllCreators(all);
}

export async function deleteCreator(id: string): Promise<void> {
  const all = await getAllCreators();
  await saveAllCreators(all.filter((c) => c.id !== id));
}
