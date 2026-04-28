import type { BankVsRroyalComparison, BenchmarkComparison } from "./types";

/** Savings vs paying the bank's retail sell rate when acquiring fiat using USD/USDT. */
export function compareBankVsRroyal(input: {
  amountUsd: number;
  bankSellRatePerUsd: number;
  rroyalMidRatePerUsd: number;
  fiatCurrency: string;
}): BankVsRroyalComparison {
  const { amountUsd, bankSellRatePerUsd, rroyalMidRatePerUsd, fiatCurrency } = input;
  const savingsPerUsd = Math.max(0, bankSellRatePerUsd - rroyalMidRatePerUsd);
  const savingsAbsolute = savingsPerUsd * amountUsd;
  const baselineCost = bankSellRatePerUsd * amountUsd;
  const savingsPctVsBankSell =
    baselineCost > 0 ? Math.min(100, (savingsAbsolute / baselineCost) * 100) : 0;

  return {
    fiatCurrency,
    bankSellRatePerUsd,
    rroyalMidRatePerUsd,
    savingsPerUsd,
    savingsAbsolute,
    savingsPctVsBankSell,
  };
}

/** Banks + average exchange-office retail vs RROYAL Smart Mid-Point (same framing as bank compare). */
export function compareRroyalVsBenchmarks(input: {
  amountUsd: number;
  bankSellRatePerUsd: number;
  exchangeOfficeSellRatePerUsd: number;
  rroyalMidRatePerUsd: number;
  fiatCurrency: string;
}): BenchmarkComparison {
  const {
    amountUsd,
    bankSellRatePerUsd,
    exchangeOfficeSellRatePerUsd,
    rroyalMidRatePerUsd,
    fiatCurrency,
  } = input;

  const vsBankPerUsd = Math.max(0, bankSellRatePerUsd - rroyalMidRatePerUsd);
  const vsOfficePerUsd = Math.max(0, exchangeOfficeSellRatePerUsd - rroyalMidRatePerUsd);

  const savingsVsBankAbsolute = vsBankPerUsd * amountUsd;
  const savingsVsExchangeOfficeAbsolute = vsOfficePerUsd * amountUsd;

  const bankBaseline = bankSellRatePerUsd * amountUsd;
  const officeBaseline = exchangeOfficeSellRatePerUsd * amountUsd;

  const savingsVsBankPct =
    bankBaseline > 0 ? Math.min(100, (savingsVsBankAbsolute / bankBaseline) * 100) : 0;
  const savingsVsExchangeOfficePct =
    officeBaseline > 0 ? Math.min(100, (savingsVsExchangeOfficeAbsolute / officeBaseline) * 100) : 0;

  return {
    fiatCurrency,
    bankSellRatePerUsd,
    exchangeOfficeSellRatePerUsd,
    rroyalMidRatePerUsd,
    savingsVsBankAbsolute,
    savingsVsExchangeOfficeAbsolute,
    savingsVsBankPct,
    savingsVsExchangeOfficePct,
  };
}
