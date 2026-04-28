/**
 * Derives simulated bank buy/sell ladder around an official USD→fiat rate,
 * then computes the RROYAL Smart Mid-Point (center of spread).
 */

export type MidPointQuote = {
  officialRatePerUsd: number;
  bankBuyRatePerUsd: number;
  bankSellRatePerUsd: number;
  rroyalMidRatePerUsd: number;
  spreadWidth: number;
  narrowSpread: boolean;
};

export function getSpreadBps(): number {
  const raw = Number(process.env.BANK_SPREAD_BPS ?? "45");
  return Number.isFinite(raw) && raw > 0 ? raw : 45;
}

/**
 * Extra sell-side markup vs simulated bank retail, modelling average street /
 * exchange-office boards (cf. aggregator benchmarks like kursi.ge).
 */
export function getExchangeOfficeExtraBps(): number {
  const raw = Number(process.env.EXCHANGE_OFFICE_EXTRA_BPS ?? "14");
  return Number.isFinite(raw) && raw >= 0 ? raw : 14;
}

/** Average exchange-office retail sell (USD→fiat): worse than bank sell by EXTRA_BPS on that leg. */
export function computeExchangeOfficeSellFromOfficial(officialRatePerUsd: number): number {
  const bankHalf = getSpreadBps() / 10_000;
  const extra = getExchangeOfficeExtraBps() / 10_000;
  return officialRatePerUsd * (1 + bankHalf + extra);
}

/** ±half-spread around official mid — multiplicative ladder (matches legacy `/api/bank-spread`). */
export function computeMidPointFromOfficial(officialRatePerUsd: number): MidPointQuote {
  const bps = getSpreadBps();
  const half = bps / 10_000;
  const bankBuyRatePerUsd = officialRatePerUsd * (1 - half);
  const bankSellRatePerUsd = officialRatePerUsd * (1 + half);
  const rroyalMidRatePerUsd = (bankBuyRatePerUsd + bankSellRatePerUsd) / 2;
  const spreadWidth = bankSellRatePerUsd - bankBuyRatePerUsd;
  return {
    officialRatePerUsd,
    bankBuyRatePerUsd,
    bankSellRatePerUsd,
    rroyalMidRatePerUsd,
    spreadWidth,
    narrowSpread: spreadWidth < 0.01,
  };
}
