import createMiddleware from "next-intl/middleware";
import { type NextRequest, NextResponse } from "next/server";

import { routing } from "./i18n/routing";

const intlMiddleware = createMiddleware(routing);

function countryFrom(request: NextRequest): string {
  const h =
    request.headers.get("x-vercel-ip-country") ||
    request.headers.get("cf-ipcountry");
  if (h && h !== "XX") return h.trim();
  return "";
}

export default function middleware(request: NextRequest) {
  const country = countryFrom(request);
  const pathname = request.nextUrl.pathname;

  if (
    country === "ZW" &&
    !request.cookies.get("rroyal_geo_locale")?.value &&
    (pathname === "/" || pathname === "")
  ) {
    const url = request.nextUrl.clone();
    url.pathname = "/sn";
    const res = NextResponse.redirect(url);
    res.cookies.set("rroyal_geo_locale", "1", {
      path: "/",
      maxAge: 60 * 60 * 24 * 400,
      sameSite: "lax",
    });
    res.cookies.set("rroyal_currency", "ZWL", {
      path: "/",
      maxAge: 60 * 60 * 24 * 400,
      sameSite: "lax",
    });
    return res;
  }

  const response = intlMiddleware(request);

  if (country) {
    response.cookies.set("rroyal_country", country, {
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
      sameSite: "lax",
    });
  }

  if (!request.cookies.get("rroyal_currency")?.value) {
    let cur = "USD";
    if (country === "ZW") cur = "ZWL";
    else if (country === "GE") cur = "GEL";
    response.cookies.set("rroyal_currency", cur, {
      path: "/",
      maxAge: 60 * 60 * 24 * 400,
      sameSite: "lax",
    });
  }

  return response;
}

export const config = {
  matcher: [
    "/",
    "/(en|ka|sn)/:path*",
    "/((?!api|_next|_vercel|.*\\..*).*)",
  ],
};
