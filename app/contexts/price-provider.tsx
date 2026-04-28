"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { compareBankVsRroyal, compareRroyalVsBenchmarks } from "@/lib/engine/comparison";
import {
  buildSmartRateQuote,
  calculateSmartRate,
  type SmartRateCalculation,
  type SmartRateQuote,
} from "@/lib/engine/smart-rate";
import type {
  BankVsRroyalComparison,
  BenchmarkComparison,
  OracleSnapshot,
} from "@/lib/engine/types";
import { corridorMetrics, resolveMidQuote, type ResolvedMidQuote } from "@/lib/engine/resolve-quote";

type Rates = Record<string, number>;

type PriceContextValue = {
  currency: string;
  setCurrency: (code: string) => void;
  rates: Rates | null;
  /** Units of local fiat per 1 USDT (USD proxy). */
  usdtInFiat: number | null;
  loading: boolean;
  /** ISO country from edge (cookie), for smart pair hints. */
  countryCode: string | null;
  source: string;
  updatedAt: number | null;
  coverage: number;
  /** Global Price Oracle — single source of truth for mid-point + corridors. */
  oracle: OracleSnapshot | null;
  /** Active fiat leg pricing (corridor-aware when applicable). */
  resolvedMidQuote: ResolvedMidQuote | null;
  corridorQuotes: ReturnType<typeof corridorMetrics>;
  compareBankVsRroyalAt: (amountUsd: number) => BankVsRroyalComparison | null;
  compareBenchmarksAt: (amountUsd: number) => BenchmarkComparison | null;
  /** Canonical Smart Rate quote (mid − 0.2% fee) for the active currency. */
  smartRateQuote: SmartRateQuote | null;
  /** Full per-trade calculation with savings proof vs all benchmarks. */
  calcSmartRateAt: (amountUsd: number) => SmartRateCalculation | null;
};

type OracleApiResponse = OracleSnapshot | { error?: string };

const PriceContext = createContext<PriceContextValue | null>(null);

const COOKIE = "smrt_currency";
const MAX_AGE = 60 * 60 * 24 * 400;

const LOCALE_CURRENCY: Record<string, string> = {
  en: "USD",
  ka: "GEL",
  ru: "USD",
};

const COUNTRY_CURRENCY: Record<string, string> = {
  GE: "GEL",
  UA: "UAH",
  KZ: "KZT",
};

function writeCurrencyCookie(code: string) {
  document.cookie = `${COOKIE}=${encodeURIComponent(code)}; path=/; max-age=${MAX_AGE}; SameSite=Lax`;
}

function resolveCurrencyCode(code: string, rates: Rates | null): string {
  const upper = code.trim().toUpperCase();
  if (!rates) return upper;
  if (rates[upper] != null) return upper;
  if (upper === "ZWL" && rates.ZWG != null) return "ZWG";
  if (upper === "ZWG" && rates.ZWL != null) return "ZWL";
  return upper;
}

function suggestedCurrency(
  locale: string,
  countryCode: string | null,
  rates: Rates | null,
  fallback: string
): string {
  /** Georgian UI route always anchors display to GEL (client directive). */
  if (locale === "ka" && rates?.GEL != null) {
    return resolveCurrencyCode("GEL", rates);
  }
  const byCountry = countryCode ? COUNTRY_CURRENCY[countryCode] : undefined;
  const byLocale = LOCALE_CURRENCY[locale] ?? "USD";
  const preferred = byCountry ?? byLocale ?? fallback;
  return resolveCurrencyCode(preferred, rates);
}

export function getRateFractionDigits(currency: string, value: number): number {
  if (!Number.isFinite(value)) return 4;
  const c = currency.toUpperCase();
  if (c === "ZWG" || c === "ZWL") return 6;
  if (value >= 1000) return 2;
  if (value >= 1) return 4;
  return 6;
}

function isOracleSnapshot(data: OracleApiResponse): data is OracleSnapshot {
  return (
    data != null &&
    typeof data === "object" &&
    "rates" in data &&
    "corridors" in data &&
    typeof (data as OracleSnapshot).updatedAt === "number"
  );
}

export function PriceProvider({
  initialCurrency,
  initialCountry,
  initialOracle,
  locale,
  children,
}: {
  initialCurrency?: string | null;
  initialCountry?: string | null;
  initialOracle?: OracleSnapshot | null;
  locale: string;
  children: ReactNode;
}) {
  const countryCode = initialCountry?.trim().toUpperCase() || null;
  const localeFallback = LOCALE_CURRENCY[locale] ?? "USD";
  const starting =
    initialCurrency?.trim().toUpperCase() ||
    COUNTRY_CURRENCY[countryCode ?? ""] ||
    localeFallback;

  const prefetchedRates = initialOracle?.rates ?? null;
  const prefetchedCurrency = suggestedCurrency(
    locale,
    countryCode,
    prefetchedRates,
    starting
  );

  const [currency, setCurrencyState] = useState(() =>
    resolveCurrencyCode(prefetchedCurrency, prefetchedRates)
  );
  const [rates, setRates] = useState<Rates | null>(prefetchedRates);
  const [oracle, setOracle] = useState<OracleSnapshot | null>(initialOracle ?? null);
  const [loading, setLoading] = useState(!prefetchedRates);
  const [source, setSource] = useState(initialOracle?.ratesSource ?? "none");
  const [updatedAt, setUpdatedAt] = useState<number | null>(
    initialOracle?.updatedAt ?? null
  );

  const setCurrency = useCallback((code: string) => {
    const c = resolveCurrencyCode(code, rates);
    setCurrencyState(c);
    writeCurrencyCookie(c);
  }, [rates]);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/oracle")
      .then((r) => r.json())
      .then((data: OracleApiResponse) => {
        if (cancelled) return;
        if (!isOracleSnapshot(data)) {
          setRates({});
          setOracle(null);
          setSource("none");
          setUpdatedAt(null);
          return;
        }
        setOracle(data);
        setRates(data.rates);
        setSource(data.ratesSource ?? "unknown");
        setUpdatedAt(data.updatedAt > 0 ? data.updatedAt : null);
        const auto = suggestedCurrency(locale, countryCode, data.rates, starting);
        if (auto && data.rates[auto] != null) {
          setCurrencyState((prev) => {
            if (prev === auto) return prev;
            writeCurrencyCookie(auto);
            return auto;
          });
        }
      })
      .catch(() => {
        if (!cancelled) {
          setRates({});
          setOracle(null);
          setSource("none");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [countryCode, locale, starting]);

  const usdtInFiat = useMemo(() => {
    if (!rates || !currency) return null;
    const v = rates[currency];
    return typeof v === "number" && Number.isFinite(v) ? v : null;
  }, [rates, currency]);

  const coverage = rates ? Object.keys(rates).length : 0;

  const resolvedMidQuote = useMemo(
    () => resolveMidQuote(oracle, currency),
    [oracle, currency]
  );

  const corridorQuotes = useMemo(() => corridorMetrics(oracle), [oracle]);

  const compareBankVsRroyalAt = useCallback(
    (amountUsd: number): BankVsRroyalComparison | null => {
      const rq = resolveMidQuote(oracle, currency);
      if (!rq || !Number.isFinite(amountUsd)) return null;
      return compareBankVsRroyal({
        amountUsd,
        bankSellRatePerUsd: rq.bankSellRatePerUsd,
        rroyalMidRatePerUsd: rq.rroyalMidRatePerUsd,
        fiatCurrency: rq.fiatCurrency,
      });
    },
    [oracle, currency]
  );

  const compareBenchmarksAt = useCallback(
    (amountUsd: number): BenchmarkComparison | null => {
      const rq = resolveMidQuote(oracle, currency);
      if (!rq || !Number.isFinite(amountUsd)) return null;
      return compareRroyalVsBenchmarks({
        amountUsd,
        bankSellRatePerUsd: rq.bankSellRatePerUsd,
        exchangeOfficeSellRatePerUsd: rq.exchangeOfficeSellRatePerUsd,
        rroyalMidRatePerUsd: rq.rroyalMidRatePerUsd,
        fiatCurrency: rq.fiatCurrency,
      });
    },
    [oracle, currency]
  );

  const smartRateQuote = useMemo((): SmartRateQuote | null => {
    const rq = resolveMidQuote(oracle, currency);
    if (!rq) return null;
    return buildSmartRateQuote(rq.rroyalMidRatePerUsd, rq.fiatCurrency);
  }, [oracle, currency]);

  const calcSmartRateAt = useCallback(
    (amountUsd: number): SmartRateCalculation | null => {
      const rq = resolveMidQuote(oracle, currency);
      if (!rq || !Number.isFinite(amountUsd) || amountUsd <= 0) return null;
      return calculateSmartRate({
        amountUsd,
        midRatePerUsd: rq.rroyalMidRatePerUsd,
        bankBuyRatePerUsd: rq.bankBuyRatePerUsd,
        bankSellRatePerUsd: rq.bankSellRatePerUsd,
        exchangeOfficeSellRatePerUsd: rq.exchangeOfficeSellRatePerUsd,
        fiatCurrency: rq.fiatCurrency,
      });
    },
    [oracle, currency]
  );

  const value = useMemo(
    () => ({
      currency,
      setCurrency,
      rates,
      usdtInFiat,
      loading,
      countryCode,
      source,
      updatedAt,
      coverage,
      oracle,
      resolvedMidQuote,
      corridorQuotes,
      compareBankVsRroyalAt,
      compareBenchmarksAt,
      smartRateQuote,
      calcSmartRateAt,
    }),
    [
      currency,
      setCurrency,
      rates,
      usdtInFiat,
      loading,
      countryCode,
      source,
      updatedAt,
      coverage,
      oracle,
      resolvedMidQuote,
      corridorQuotes,
      compareBankVsRroyalAt,
      compareBenchmarksAt,
      smartRateQuote,
      calcSmartRateAt,
    ]
  );

  return <PriceContext.Provider value={value}>{children}</PriceContext.Provider>;
}

export function usePrice() {
  const ctx = useContext(PriceContext);
  if (!ctx) {
    throw new Error("usePrice must be used within PriceProvider");
  }
  return ctx;
}

/** Backward-compatible alias for existing components. */
export const useCurrency = usePrice;
