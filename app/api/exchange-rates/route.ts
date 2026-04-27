import { NextResponse } from "next/server";

export const revalidate = 3600;

type ErApiV6 = {
  result: string;
  base_code?: string;
  rates?: Record<string, number>;
  time_last_update_unix?: number;
};

type OerResponse = {
  base: string;
  rates?: Record<string, number>;
  timestamp?: number;
};

async function fetchOpenExchangeRates(): Promise<{
  base: string;
  rates: Record<string, number>;
  updated: number;
  source: string;
} | null> {
  const appId = process.env.OPEN_EXCHANGE_RATES_APP_ID?.trim();
  if (!appId) return null;
  const res = await fetch(
    `https://openexchangerates.org/api/latest.json?app_id=${appId}`,
    { next: { revalidate: 3600 } }
  );
  if (!res.ok) return null;
  const data = (await res.json()) as OerResponse;
  if (!data.rates) return null;
  return {
    base: data.base || "USD",
    rates: data.rates,
    updated: data.timestamp ?? Math.floor(Date.now() / 1000),
    source: "openexchangerates",
  };
}

async function fetchErApi(): Promise<{
  base: string;
  rates: Record<string, number>;
  updated: number;
  source: string;
}> {
  const res = await fetch("https://open.er-api.com/v6/latest/USD", {
    next: { revalidate: 3600 },
  });
  if (!res.ok) {
    throw new Error(`er-api HTTP ${res.status}`);
  }
  const data = (await res.json()) as ErApiV6;
  if (data.result !== "success" || !data.rates) {
    throw new Error("er-api invalid payload");
  }
  return {
    base: "USD",
    rates: data.rates,
    updated: data.time_last_update_unix ?? Math.floor(Date.now() / 1000),
    source: "open.er-api",
  };
}

export async function GET() {
  try {
    const oer = await fetchOpenExchangeRates();
    if (oer) {
      return NextResponse.json(oer);
    }
    const fallback = await fetchErApi();
    return NextResponse.json(fallback);
  } catch {
    return NextResponse.json(
      { base: "USD", rates: {}, updated: 0, source: "none", error: true },
      { status: 502 }
    );
  }
}
