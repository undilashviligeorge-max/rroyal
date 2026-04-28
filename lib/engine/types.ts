/** Shared financial-engine types for RROYAL DEX. */

export type CorridorDefinition = {
  id: string;
  originCountry: string;
  destinationCountry: string;
  /** Fiat leg used for bank vs mid-point pricing (USD = 1). */
  fiatCurrency: string;
  /** Typical settlement SLA for UI metrics (minutes). */
  settlementMinutesTypical: number;
};

/** Single fiat leg pricing vs USD anchor (USDT proxy). */
export type CorridorQuote = CorridorDefinition & {
  officialRatePerUsd: number;
  bankBuyRatePerUsd: number;
  bankSellRatePerUsd: number;
  /** Typical street / exchange-office retail sell — benchmark vs aggregated booth boards. */
  exchangeOfficeSellRatePerUsd: number;
  rroyalMidRatePerUsd: number;
  spreadWidth: number;
  narrowSpread: boolean;
};

export type OracleSnapshot = {
  base: string;
  updatedAt: number;
  ratesSource: string;
  coverage: number;
  rates: Record<string, number>;
  corridors: CorridorQuote[];
};

export type BankVsRroyalComparison = {
  fiatCurrency: string;
  bankSellRatePerUsd: number;
  rroyalMidRatePerUsd: number;
  savingsPerUsd: number;
  savingsAbsolute: number;
  savingsPctVsBankSell: number;
};

/** Savings vs simulated bank retail and vs average exchange-office retail (same USD notion). */
export type BenchmarkComparison = {
  fiatCurrency: string;
  bankSellRatePerUsd: number;
  exchangeOfficeSellRatePerUsd: number;
  rroyalMidRatePerUsd: number;
  savingsVsBankAbsolute: number;
  savingsVsExchangeOfficeAbsolute: number;
  savingsVsBankPct: number;
  savingsVsExchangeOfficePct: number;
};
