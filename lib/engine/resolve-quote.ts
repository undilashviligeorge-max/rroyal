import { computeExchangeOfficeSellFromOfficial, computeMidPointFromOfficial } from "./bank-spread";
import type { CorridorQuote, OracleSnapshot } from "./types";

/** Effective mid + bank ladder for the selected fiat (corridor row or general rate fallback). */
export type ResolvedMidQuote = {
  fiatCurrency: string;
  bankSellRatePerUsd: number;
  exchangeOfficeSellRatePerUsd: number;
  bankBuyRatePerUsd: number;
  rroyalMidRatePerUsd: number;
  officialRatePerUsd: number;
  narrowSpread: boolean;
  corridorId?: string;
  settlementMinutesTypical?: number;
};

function rateForFiat(snapshot: OracleSnapshot, code: string): number | null {
  const u = code.toUpperCase();
  const v = snapshot.rates[u];
  if (typeof v === "number" && Number.isFinite(v)) return v;
  if (u === "ZWL" && snapshot.rates.ZWG != null) return snapshot.rates.ZWG;
  if (u === "ZWG" && snapshot.rates.ZWL != null) return snapshot.rates.ZWL;
  return null;
}

export function resolveMidQuote(snapshot: OracleSnapshot | null, currency: string): ResolvedMidQuote | null {
  if (!snapshot) return null;
  const u = currency.trim().toUpperCase();
  const corridor = snapshot.corridors.find((c) => c.fiatCurrency === u);
  if (corridor) {
    return {
      fiatCurrency: corridor.fiatCurrency,
      bankSellRatePerUsd: corridor.bankSellRatePerUsd,
      exchangeOfficeSellRatePerUsd: corridor.exchangeOfficeSellRatePerUsd,
      bankBuyRatePerUsd: corridor.bankBuyRatePerUsd,
      rroyalMidRatePerUsd: corridor.rroyalMidRatePerUsd,
      officialRatePerUsd: corridor.officialRatePerUsd,
      narrowSpread: corridor.narrowSpread,
      corridorId: corridor.id,
      settlementMinutesTypical: corridor.settlementMinutesTypical,
    };
  }
  const official = rateForFiat(snapshot, u);
  if (official == null) return null;
  const mp = computeMidPointFromOfficial(official);
  const exchangeOfficeSellRatePerUsd = computeExchangeOfficeSellFromOfficial(official);
  return {
    fiatCurrency: u,
    bankSellRatePerUsd: mp.bankSellRatePerUsd,
    exchangeOfficeSellRatePerUsd,
    bankBuyRatePerUsd: mp.bankBuyRatePerUsd,
    rroyalMidRatePerUsd: mp.rroyalMidRatePerUsd,
    officialRatePerUsd: mp.officialRatePerUsd,
    narrowSpread: mp.narrowSpread,
  };
}

export function corridorMetrics(snapshot: OracleSnapshot | null): CorridorQuote[] {
  return snapshot?.corridors ?? [];
}
