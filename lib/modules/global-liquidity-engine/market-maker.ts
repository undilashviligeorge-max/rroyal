/**
 * Market-maker rule: RROYAL Smart Mid-Point always sits **between** simulated bank buy and bank sell
 * around the official USD→fiat print from the feed (symmetric spread ladder).
 */
import {
  computeExchangeOfficeSellFromOfficial,
  computeMidPointFromOfficial,
  type MidPointQuote,
} from "@/lib/engine/bank-spread";

export type RroyalLiquidityLeg = MidPointQuote & {
  exchangeOfficeSellRatePerUsd: number;
};

/** Full ladder: bank buy / RROYAL mid / bank sell + exchange-office retail sell benchmark. */
export function quoteLiquidityLeg(officialUsdToFiat: number): RroyalLiquidityLeg {
  const mm = computeMidPointFromOfficial(officialUsdToFiat);
  return {
    ...mm,
    exchangeOfficeSellRatePerUsd: computeExchangeOfficeSellFromOfficial(officialUsdToFiat),
  };
}
