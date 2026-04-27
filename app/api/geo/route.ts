import { NextRequest, NextResponse } from "next/server";

/**
 * Lightweight geo hint from trusted proxy headers (Vercel / Cloudflare).
 * No third-party Geo-IP call — keeps middleware fast and privacy-friendly.
 */
export function GET(request: NextRequest) {
  const country =
    request.headers.get("x-vercel-ip-country") ||
    request.headers.get("cf-ipcountry") ||
    null;

  return NextResponse.json({
    country: country && country !== "XX" ? country.trim() : null,
    source: "edge-headers",
  });
}
