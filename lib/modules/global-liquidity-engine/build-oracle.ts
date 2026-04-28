import type { GlobalRatesPayload } from "@/lib/modules/global-liquidity-engine/feed";
import { getGlobalRates } from "@/lib/modules/global-liquidity-engine/feed";

import { ACTIVE_CORRIDORS } from "@/lib/engine/corridors";
import type { CorridorQuote, OracleSnapshot } from "@/lib/engine/types";

import { quoteLiquidityLeg } from "./market-maker";

function resolveOfficialRate(rates: Record<string, number>, fiat: string): number | null {
  const u = fiat.toUpperCase();
  const v = rates[u];
  if (typeof v === "number" && Number.isFinite(v)) return v;
  if (u === "ZWL" && rates.ZWG != null) return rates.ZWG;
  if (u === "ZWG" && rates.ZWL != null) return rates.ZWL;
  return null;
}

/** Canonical oracle snapshot — corridors priced by the Global Liquidity Engine. */
export function buildOracleSnapshot(payload: GlobalRatesPayload): OracleSnapshot {
  const corridors: CorridorQuote[] = [];

  for (const def of ACTIVE_CORRIDORS) {
    const official = resolveOfficialRate(payload.rates, def.fiatCurrency);
    if (official == null) continue;
    const leg = quoteLiquidityLeg(official);
    corridors.push({
      ...def,
      officialRatePerUsd: leg.officialRatePerUsd,
      bankBuyRatePerUsd: leg.bankBuyRatePerUsd,
      bankSellRatePerUsd: leg.bankSellRatePerUsd,
      exchangeOfficeSellRatePerUsd: leg.exchangeOfficeSellRatePerUsd,
      rroyalMidRatePerUsd: leg.rroyalMidRatePerUsd,
      spreadWidth: leg.spreadWidth,
      narrowSpread: leg.narrowSpread,
    });
  }

  return {
    base: payload.base,
    updatedAt: payload.updated,
    ratesSource: payload.source,
    coverage: payload.coverage,
    rates: payload.rates,
    corridors,
  };
}

export async function getOracleSnapshot(): Promise<OracleSnapshot> {
  const payload = await getGlobalRates();
  return buildOracleSnapshot(payload);
}
