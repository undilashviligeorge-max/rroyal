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
import type { GlobalRatesPayload } from "@/lib/global-rates";

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
};

type ExchangeRatesResponse = {
  rates?: Rates;
  source?: string;
  updated?: number;
  coverage?: number;
};

const PriceContext = createContext<PriceContextValue | null>(null);

const COOKIE = "rroyal_currency";
const MAX_AGE = 60 * 60 * 24 * 400;

const LOCALE_CURRENCY: Record<string, string> = {
  en: "USD",
  ka: "GEL",
  sn: "ZWG",
};

const COUNTRY_CURRENCY: Record<string, string> = {
  GE: "GEL",
  ZW: "ZWG",
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

export function PriceProvider({
  initialCurrency,
  initialCountry,
  initialRates,
  locale,
  children,
}: {
  initialCurrency?: string | null;
  initialCountry?: string | null;
  initialRates?: GlobalRatesPayload | null;
  locale: string;
  children: ReactNode;
}) {
  const countryCode = initialCountry?.trim().toUpperCase() || null;
  const localeFallback = LOCALE_CURRENCY[locale] ?? "USD";
  const starting =
    initialCurrency?.trim().toUpperCase() ||
    COUNTRY_CURRENCY[countryCode ?? ""] ||
    localeFallback;

  const prefetchedRates = initialRates?.rates ?? null;
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
  const [loading, setLoading] = useState(!prefetchedRates);
  const [source, setSource] = useState(initialRates?.source ?? "none");
  const [updatedAt, setUpdatedAt] = useState<number | null>(
    initialRates?.updated ?? null
  );

  const setCurrency = useCallback((code: string) => {
    const c = resolveCurrencyCode(code, rates);
    setCurrencyState(c);
    writeCurrencyCookie(c);
  }, [rates]);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/exchange-rates")
      .then((r) => r.json())
      .then((data: ExchangeRatesResponse) => {
        if (cancelled) return;
        const fetchedRates = data.rates ?? {};
        setRates(fetchedRates);
        setSource(data.source ?? "unknown");
        setUpdatedAt(
          typeof data.updated === "number" && data.updated > 0 ? data.updated : null
        );
        const auto = suggestedCurrency(locale, countryCode, fetchedRates, starting);
        if (auto && fetchedRates[auto] != null) {
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
    }),
    [currency, setCurrency, rates, usdtInFiat, loading, countryCode, source, updatedAt, coverage]
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
