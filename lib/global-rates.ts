export type GlobalRatesPayload = {
  base: string;
  rates: Record<string, number>;
  updated: number;
  source: string;
  coverage: number;
};

type ErApiV6 = {
  result: string;
  rates?: Record<string, number>;
  time_last_update_unix?: number;
};

type ExchangeRateApiV6 = {
  result: "success" | "error";
  base_code?: string;
  conversion_rates?: Record<string, number>;
  time_last_update_unix?: number;
};

type OerResponse = {
  base: string;
  rates?: Record<string, number>;
  timestamp?: number;
};

async function fetchExchangeRateApi(): Promise<GlobalRatesPayload | null> {
  const apiKey = process.env.EXCHANGERATE_API_KEY?.trim();
  if (!apiKey) return null;
  const res = await fetch(`https://v6.exchangerate-api.com/v6/${apiKey}/latest/USD`, {
    next: { revalidate: 1800 },
  });
  if (!res.ok) return null;
  const data = (await res.json()) as ExchangeRateApiV6;
  if (data.result !== "success" || !data.conversion_rates) return null;
  const rates = data.conversion_rates;
  return {
    base: data.base_code || "USD",
    rates,
    updated: data.time_last_update_unix ?? Math.floor(Date.now() / 1000),
    source: "exchangerate-api",
    coverage: Object.keys(rates).length,
  };
}

async function fetchOpenExchangeRates(): Promise<GlobalRatesPayload | null> {
  const appId = process.env.OPEN_EXCHANGE_RATES_APP_ID?.trim();
  if (!appId) return null;
  const res = await fetch(
    `https://openexchangerates.org/api/latest.json?app_id=${appId}`,
    { next: { revalidate: 1800 } }
  );
  if (!res.ok) return null;
  const data = (await res.json()) as OerResponse;
  if (!data.rates) return null;
  const rates = data.rates;
  return {
    base: data.base || "USD",
    rates,
    updated: data.timestamp ?? Math.floor(Date.now() / 1000),
    source: "openexchangerates",
    coverage: Object.keys(rates).length,
  };
}

async function fetchErApi(): Promise<GlobalRatesPayload> {
  const res = await fetch("https://open.er-api.com/v6/latest/USD", {
    next: { revalidate: 1800 },
  });
  if (!res.ok) {
    throw new Error(`er-api HTTP ${res.status}`);
  }
  const data = (await res.json()) as ErApiV6;
  if (data.result !== "success" || !data.rates) {
    throw new Error("er-api invalid payload");
  }
  const rates = data.rates;
  return {
    base: "USD",
    rates,
    updated: data.time_last_update_unix ?? Math.floor(Date.now() / 1000),
    source: "open.er-api",
    coverage: Object.keys(rates).length,
  };
}

export async function getGlobalRates(): Promise<GlobalRatesPayload> {
  const exr = await fetchExchangeRateApi();
  if (exr) return exr;

  const oer = await fetchOpenExchangeRates();
  if (oer) return oer;

  return fetchErApi();
}
