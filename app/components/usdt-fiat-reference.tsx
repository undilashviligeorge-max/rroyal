"use client";

import { useFormatter, useTranslations } from "next-intl";

import { RateTrustBadge } from "./rate-trust-badge";
import { getRateFractionDigits, useCurrency } from "../contexts/price-provider";

export function UsdtFiatReference() {
  const t = useTranslations("Home");
  const format = useFormatter();
  const {
    currency,
    loading,
    resolvedMidQuote,
    compareBankVsRroyalAt,
    corridorQuotes,
  } = useCurrency();

  if (loading) {
    return (
      <>
        <p className="mt-2 font-mono text-sm tabular-nums tracking-wide text-zinc-600">
          {t("ratesStale")}
        </p>
        <RateTrustBadge />
      </>
    );
  }

  const displayRate =
    resolvedMidQuote?.rroyalMidRatePerUsd ??
    null;

  if (displayRate == null) {
    return (
      <>
        <p className="mt-2 font-mono text-sm tabular-nums tracking-wide text-zinc-500">
          1 USDT ≈ — {currency}
        </p>
        <RateTrustBadge />
      </>
    );
  }

  const amount = format.number(displayRate, {
    maximumFractionDigits: getRateFractionDigits(currency, displayRate),
    minimumFractionDigits: 2,
  });

  const rq = resolvedMidQuote;
  const perDollar = compareBankVsRroyalAt(1);
  const bankSellFmt =
    perDollar != null && rq != null
      ? format.number(rq.bankSellRatePerUsd, {
          maximumFractionDigits: getRateFractionDigits(currency, rq.bankSellRatePerUsd),
          minimumFractionDigits: 2,
        })
      : null;

  const savePerUsdFmt =
    perDollar != null && perDollar.savingsPerUsd > 0
      ? format.number(perDollar.savingsPerUsd, {
          maximumFractionDigits: getRateFractionDigits(currency, perDollar.savingsPerUsd),
          minimumFractionDigits: 2,
        })
      : null;

  const activeCorridor = rq?.corridorId
    ? corridorQuotes.find((c) => c.id === rq.corridorId)
    : undefined;

  return (
    <>
      <p className="mt-2 font-mono text-lg font-medium tabular-nums tracking-wide text-emerald-100 sm:text-xl">
        {t("usdtSmartMid", { amount, code: currency })}
      </p>
      {perDollar != null && bankSellFmt != null ? (
        <p className="mt-2 text-left text-[11px] leading-relaxed tracking-wide text-zinc-400">
          {perDollar.savingsPerUsd > 0 && savePerUsdFmt != null
            ? t("bankVsRroyalDetail", {
                sellAmount: bankSellFmt,
                savePerUsd: savePerUsdFmt,
                code: currency,
                pct: perDollar.savingsPctVsBankSell.toFixed(2),
              })
            : t("bankVsRroyalTie", {
                sellAmount: bankSellFmt,
                midAmount: amount,
                code: currency,
              })}
        </p>
      ) : null}
      {activeCorridor ? (
        <p className="mt-1 text-left text-[10px] uppercase tracking-[0.14em] text-zinc-600">
          {t("corridorBadge", {
            id: activeCorridor.id,
            mins: activeCorridor.settlementMinutesTypical,
          })}
        </p>
      ) : null}
      <RateTrustBadge />
    </>
  );
}
