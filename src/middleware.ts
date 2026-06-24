import { NextRequest, NextResponse } from "next/server";

const SESSION_COOKIE = "gs_auth";
const SECRET = process.env.SESSION_SECRET ?? "gold-studios-super-secret-2024-change-me";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (pathname.startsWith("/login") || pathname.startsWith("/api/login")) {
    return NextResponse.next();
  }

  // TikTok/other verification files and legal pages are public
  if (pathname.startsWith("/tiktok") || pathname === "/privacy" || pathname === "/terms") {
    return NextResponse.next();
  }

  // Share links are public — brands don't need a password
  if (pathname.startsWith("/share/")) {
    return NextResponse.next();
  }

  // Connect links are public — creators link their accounts without needing the agency password
  if (pathname.startsWith("/connect/") || pathname.startsWith("/api/auth/") || pathname.startsWith("/api/connect/")) {
    return NextResponse.next();
  }

  const token = req.cookies.get(SESSION_COOKIE)?.value;
  const expected = Buffer.from(SECRET).toString("base64");

  if (token !== expected) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|tgs-logo.png).*)"],
};
