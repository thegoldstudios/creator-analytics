import { cookies } from "next/headers";

const SESSION_COOKIE = "gs_auth";
// Change this secret to anything long and random — it signs the cookie
const SECRET = process.env.SESSION_SECRET ?? "gold-studios-super-secret-2024-change-me";
const TEAM_PASSWORD = process.env.TEAM_PASSWORD ?? "goldstudios2024";

export async function isAuthenticated(): Promise<boolean> {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  return token === Buffer.from(SECRET).toString("base64");
}

export function makeToken(): string {
  return Buffer.from(SECRET).toString("base64");
}

export { SESSION_COOKIE, TEAM_PASSWORD };
