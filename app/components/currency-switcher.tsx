"use client";

import { useTranslations } from "next-intl";

import { useCurrency } from "../contexts/price-provider";

function isSmartPair(country: string | null, currency: string): boolean {
  if (!country) return false;
  if (country === "GE" && currency === "GEL") return true;
  if (country === "ZW" && (currency === "ZWG" || currency === "ZWL")) return true;
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
        <span className="text-[11px] font-medium uppercase tracking-[0.16em] text-zinc-500">
          {t("currencyLabel")}
        </span>
        <select
          value={codes.includes(currency) ? currency : "USD"}
          disabled={loading || codes.length === 0}
          onChange={(e) => setCurrency(e.target.value)}
          className="w-full rounded-xl border border-white/10 bg-black/50 px-3 py-2 text-sm font-medium tracking-wide text-zinc-100 focus:border-cyan-500/40 focus:outline-none focus:ring-1 focus:ring-cyan-500/25 disabled:opacity-50"
        >
          {codes.length === 0 ? (
            <option value="USD">USD</option>
          ) : (
            codes.map((c) => (
              <option key={c} value={c} className="bg-zinc-900 text-zinc-100">
                {c}
              </option>
            ))
          )}
        </select>
      </label>
      {smart ? (
        <p className="text-[10px] leading-snug tracking-wide text-zinc-600">{t("smartPairHint")}</p>
      ) : null}
    </div>
  );
}
