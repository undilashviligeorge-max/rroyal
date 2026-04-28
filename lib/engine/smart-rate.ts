/**
 * SMRT / MONEY — Smart Mid-Point Pricing Engine
 *
 * Mathematical model:
 *   1. Fetch official USD→fiat mid-rate (central-bank / oracle feed).
 *   2. The bank retail spread is BANK_SPREAD_BPS on each leg (default 45 bps).
 *      • Bank buy leg  = mid × (1 − half)   ← what banks give when you sell USD
 *      • Bank sell leg = mid × (1 + half)   ← what banks charge when you buy USD
 *      • Smart Mid-Point = (bankBuy + bankSell) / 2  = mid (symmetric spread)
 *   3. SMRT charges a transparent PLATFORM_FEE_PCT on the converted amount.
 *      • Effective rate  = mid × (1 − PLATFORM_FEE_PCT)
 *      • Fee amount      = (mid − effectiveRate) × amountUsd
 *   4. User savings vs bank buy leg (what they'd actually get at a bank selling USD):
 *      • savings = (effectiveRate − bankBuyRatePerUsd) × amountUsd
 *      Positive because: mid × 0.998 > mid × (1 − 0.00225) when fee < half-spread.
 */

/** Single source of truth for the disclosed platform fee. */
export const PLATFORM_FEE_PCT = 0.002; // 0.2 %

export type SmartRateQuote = {
  /** Oracle mid-point, no fee applied. */
  midRatePerUsd: number;
  /** What users actually receive per USD (after fee). */
  effectiveRatePerUsd: number;
  /** Fee deducted per USD converted. */
  platformFeePerUsd: number;
  /** Fractional fee, e.g. 0.002. */
  platformFeePct: number;
  fiatCurrency: string;
};

/** Per-trade calculation including savings proof. */
export type SmartRateCalculation = {
  amountUsd: number;
  fiatCurrency: string;
  /** Gross fiat at mid-rate (before fee). */
  fiatGross: number;
  /** Platform fee amount in fiat. */
  fiatFee: number;
  /** Net fiat user receives. */
  fiatNet: number;
  /** Effective SMRT rate per USD (= fiatNet / amountUsd). */
  effectiveRatePerUsd: number;
  /** What user would receive at bank's buy-side rate (selling USD to bank). */
  bankBuyFiatReceived: number;
  /** Savings vs bank buy — can be negative if fee > half-spread (shows honestly). */
  savingsVsBankBuyFiat: number;
  savingsVsBankBuyPct: number;
  /** Savings vs bank's sell-side rate (used in full comparison view). */
  bankSellFiatReceived: number;
  savingsVsBankSellFiat: number;
  savingsVsBankSellPct: number;
  /** Savings vs exchange-office sell (most impressive, still honest). */
  exchangeOfficeSellFiatReceived: number;
  savingsVsExchangeOfficeFiat: number;
  savingsVsExchangeOfficePct: number;
};

/** Build the Smart Rate quote from a resolved mid-point. */
export function buildSmartRateQuote(
  midRatePerUsd: number,
  fiatCurrency: string
): SmartRateQuote {
  const effectiveRatePerUsd = midRatePerUsd * (1 - PLATFORM_FEE_PCT);
  return {
    midRatePerUsd,
    effectiveRatePerUsd,
    platformFeePerUsd: midRatePerUsd - effectiveRatePerUsd,
    platformFeePct: PLATFORM_FEE_PCT,
    fiatCurrency,
  };
}

/** Full per-trade breakdown — all figures the UI needs. */
export function calculateSmartRate(input: {
  amountUsd: number;
  midRatePerUsd: number;
  bankBuyRatePerUsd: number;
  bankSellRatePerUsd: number;
  exchangeOfficeSellRatePerUsd: number;
  fiatCurrency: string;
}): SmartRateCalculation {
  const {
    amountUsd,
    midRatePerUsd,
    bankBuyRatePerUsd,
    bankSellRatePerUsd,
    exchangeOfficeSellRatePerUsd,
    fiatCurrency,
  } = input;

  const effectiveRatePerUsd = midRatePerUsd * (1 - PLATFORM_FEE_PCT);
  const fiatGross = midRatePerUsd * amountUsd;
  const fiatFee = fiatGross * PLATFORM_FEE_PCT;
  const fiatNet = fiatGross - fiatFee; // = effectiveRatePerUsd * amountUsd

  const bankBuyFiatReceived = bankBuyRatePerUsd * amountUsd;
  const bankSellFiatReceived = bankSellRatePerUsd * amountUsd;
  const exchangeOfficeSellFiatReceived = exchangeOfficeSellRatePerUsd * amountUsd;

  const savingsVsBankBuyFiat = fiatNet - bankBuyFiatReceived;
  const savingsVsBankSellFiat = bankSellFiatReceived - fiatNet;
  const savingsVsExchangeOfficeFiat = exchangeOfficeSellFiatReceived - fiatNet;

  const pct = (savings: number, baseline: number) =>
    baseline > 0 ? (savings / baseline) * 100 : 0;

  return {
    amountUsd,
    fiatCurrency,
    fiatGross,
    fiatFee,
    fiatNet,
    effectiveRatePerUsd,
    bankBuyFiatReceived,
    savingsVsBankBuyFiat,
    savingsVsBankBuyPct: pct(savingsVsBankBuyFiat, bankBuyFiatReceived),
    bankSellFiatReceived,
    savingsVsBankSellFiat,
    savingsVsBankSellPct: pct(savingsVsBankSellFiat, bankSellFiatReceived),
    exchangeOfficeSellFiatReceived,
    savingsVsExchangeOfficeFiat,
    savingsVsExchangeOfficePct: pct(savingsVsExchangeOfficeFiat, exchangeOfficeSellFiatReceived),
  };
}
