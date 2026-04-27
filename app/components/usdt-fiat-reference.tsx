"use client";

import { useFormatter, useTranslations } from "next-intl";

import { useCurrency } from "../contexts/currency-provider";

export function UsdtFiatReference() {
  const t = useTranslations("Home");
  const format = useFormatter();
  const { currency, usdtInFiat, loading } = useCurrency();

  if (loading) {
    return (
      <p className="mt-2 font-mono text-sm tabular-nums text-zinc-400">
        {t("ratesStale")}
      </p>
    );
  }

  if (usdtInFiat == null) {
    return (
      <p className="mt-2 font-mono text-sm tabular-nums text-zinc-500">
        1 USDT ≈ — {currency}
      </p>
    );
  }

  const amount = format.number(usdtInFiat, {
    maximumFractionDigits: 4,
    minimumFractionDigits: 2,
  });

  return (
    <p className="mt-2 font-mono text-lg font-medium tabular-nums tracking-tight text-zinc-900 sm:text-xl">
      {t("usdtReference", { amount, code: currency })}
    </p>
  );
}
