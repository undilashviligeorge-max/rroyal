"use client";

import { useTranslations } from "next-intl";

import { useCurrency } from "../contexts/currency-provider";

function isSmartPair(country: string | null, currency: string): boolean {
  if (!country) return false;
  if (country === "GE" && currency === "GEL") return true;
  if (country === "ZW" && currency === "ZWL") return true;
  return false;
}

export function CurrencySwitcher() {
  const t = useTranslations("Home");
  const { currency, setCurrency, rates, loading, countryCode } = useCurrency();

  const codes = rates
    ? Object.keys(rates).sort((a, b) => a.localeCompare(b))
    : [];

  const smart = isSmartPair(countryCode, currency);

  return (
    <div className="flex min-w-0 flex-1 flex-col gap-1 sm:max-w-[220px]">
      <label className="flex flex-col gap-1">
        <span className="text-[11px] font-medium uppercase tracking-wide text-zinc-500">
          {t("currencyLabel")}
        </span>
        <select
          value={codes.includes(currency) ? currency : "USD"}
          disabled={loading || codes.length === 0}
          onChange={(e) => setCurrency(e.target.value)}
          className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm font-medium text-zinc-900 focus:border-zinc-400 focus:outline-none disabled:opacity-50"
        >
          {codes.length === 0 ? (
            <option value="USD">USD</option>
          ) : (
            codes.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))
          )}
        </select>
      </label>
      {smart ? (
        <p className="text-[10px] leading-snug text-zinc-400">{t("smartPairHint")}</p>
      ) : null}
    </div>
  );
}
