import createMiddleware from "next-intl/middleware";
import { type NextRequest, NextResponse } from "next/server";

import { routing } from "./i18n/routing";

const intlMiddleware = createMiddleware(routing);

/**
 * Default `/ru` for post-Soviet states where Russian UI is typical (includes UA, KZ).
 * Georgia (`GE`) is routed to `/ka` separately — primary market.
 */
const POST_SOVIET_RU_DEFAULT = new Set([
  "RU",
  "BY",
  "UA",
  "MD",
  "AM",
  "AZ",
  "KZ",
  "KG",
  "TJ",
  "TM",
  "UZ",
]);

function countryFrom(request: NextRequest): string {
  const h =
    request.headers.get("x-vercel-ip-country") ||
    request.headers.get("cf-ipcountry");
  if (h && h !== "XX") return h.trim();
  return "";
}

function geoLocaleForCountry(country: string): "ka" | "ru" | "en" {
  if (country === "GE") return "ka";
  if (POST_SOVIET_RU_DEFAULT.has(country)) return "ru";
  return "en";
}

export default function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const country = countryFrom(request);

  if (pathname.startsWith("/sn")) {
    const url = request.nextUrl.clone();
    url.pathname = pathname.replace(/^\/sn/, "/ru") || "/ru";
    return NextResponse.redirect(url, 308);
  }

  if (pathname === "/" || pathname === "") {
    const pref = request.cookies.get("smrt_pref_locale")?.value;
    let target: "en" | "ka" | "ru";
    if (pref === "en" || pref === "ka" || pref === "ru") {
      target = pref;
    } else {
      target = geoLocaleForCountry(country);
    }

    const url = request.nextUrl.clone();
    url.pathname = `/${target}`;
    const res = NextResponse.redirect(url);
    if (country) {
      res.cookies.set("smrt_country", country, {
        path: "/",
        maxAge: 60 * 60 * 24 * 30,
        sameSite: "lax",
      });
    }
    if (!request.cookies.get("smrt_currency")?.value) {
      let cur = "USD";
      if (country === "GE") cur = "GEL";
      else if (country === "UA") cur = "UAH";
      else if (country === "KZ") cur = "KZT";
      res.cookies.set("smrt_currency", cur, {
        path: "/",
        maxAge: 60 * 60 * 24 * 400,
        sameSite: "lax",
      });
    }
    return res;
  }

  const response = intlMiddleware(request);

  if (country) {
    response.cookies.set("smrt_country", country, {
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
      sameSite: "lax",
    });
  }

  if (!request.cookies.get("smrt_currency")?.value) {
    let cur = "USD";
    if (country === "GE") cur = "GEL";
    else if (country === "UA") cur = "UAH";
    else if (country === "KZ") cur = "KZT";
    response.cookies.set("smrt_currency", cur, {
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
    "/(en|ka|ru)/:path*",
    "/((?!api|_next|_vercel|.*\\..*).*)",
  ],
};
