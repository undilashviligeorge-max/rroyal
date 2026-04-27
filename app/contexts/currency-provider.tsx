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

type Rates = Record<string, number>;

type CurrencyContextValue = {
  currency: string;
  setCurrency: (code: string) => void;
  rates: Rates | null;
  /** Units of local fiat per 1 USD (USDT proxy). */
  usdtInFiat: number | null;
  loading: boolean;
  /** ISO country from edge (cookie), for smart pair hints. */
  countryCode: string | null;
};

const CurrencyContext = createContext<CurrencyContextValue | null>(null);

const COOKIE = "rroyal_currency";
const MAX_AGE = 60 * 60 * 24 * 400;

export function CurrencyProvider({
  initialCurrency,
  initialCountry,
  children,
}: {
  initialCurrency: string;
  initialCountry?: string | null;
  children: ReactNode;
}) {
  const [currency, setCurrencyState] = useState(() =>
    initialCurrency ? initialCurrency.toUpperCase() : "USD"
  );
  const [rates, setRates] = useState<Rates | null>(null);
  const [loading, setLoading] = useState(true);

  const setCurrency = useCallback((code: string) => {
    const c = code.toUpperCase();
    setCurrencyState(c);
    document.cookie = `${COOKIE}=${encodeURIComponent(c)}; path=/; max-age=${MAX_AGE}; SameSite=Lax`;
  }, []);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/exchange-rates")
      .then((r) => r.json())
      .then((data: { rates?: Rates }) => {
        if (!cancelled && data.rates) setRates(data.rates);
      })
      .catch(() => {
        if (!cancelled) setRates({});
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const usdtInFiat = useMemo(() => {
    if (!rates || !currency) return null;
    const v = rates[currency];
    return typeof v === "number" && Number.isFinite(v) ? v : null;
  }, [rates, currency]);

  const countryCode = initialCountry?.trim().toUpperCase() || null;

  const value = useMemo(
    () => ({
      currency,
      setCurrency,
      rates,
      usdtInFiat,
      loading,
      countryCode,
    }),
    [currency, setCurrency, rates, usdtInFiat, loading, countryCode]
  );

  return (
    <CurrencyContext.Provider value={value}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const ctx = useContext(CurrencyContext);
  if (!ctx) {
    throw new Error("useCurrency must be used within CurrencyProvider");
  }
  return ctx;
}
