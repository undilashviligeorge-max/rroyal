"use client";

import { useFormatter, useTranslations } from "next-intl";

import { PLATFORM_FEE_PCT } from "@/lib/engine/smart-rate";

import { getRateFractionDigits, useCurrency } from "../contexts/price-provider";

const SAMPLE_USD = 1000;

export function ComparisonPanel() {
  const t = useTranslations("Home");
  const format = useFormatter();
  const { currency, resolvedMidQuote, calcSmartRateAt, loading } = useCurrency();

  const calc = calcSmartRateAt(SAMPLE_USD);

  const fmtRate = (v: number) =>
    format.number(v, {
      maximumFractionDigits: getRateFractionDigits(currency, v),
      minimumFractionDigits: 4,
    });

  const fmtFiat = (v: number) =>
    format.number(v, {
      maximumFractionDigits: 2,
      minimumFractionDigits: 2,
    });

  const feePct = (PLATFORM_FEE_PCT * 100).toFixed(1);

  return (
    <section
      className="cosmic-glass-panel mt-10 rounded-2xl p-5 sm:p-6"
      aria-labelledby="comparison-panel-heading"
    >
      {/* Header */}
      <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-400/80">
            {t("comparisonEyebrow")}
          </p>
          <h2
            id="comparison-panel-heading"
            className="mt-1 text-lg font-bold tracking-[0.04em] text-zinc-50 sm:text-xl"
          >
            {t("comparisonTitle")}
          </h2>
          <p className="mt-1 max-w-xl text-xs leading-relaxed tracking-wide text-zinc-500">
            {t("comparisonSubtitle")}
          </p>
        </div>
        <p className="shrink-0 text-[11px] tabular-nums tracking-wide text-zinc-600">
          {t("comparisonSample", { usd: SAMPLE_USD.toLocaleString(), fiat: currency })}
        </p>
      </div>

      {loading || !resolvedMidQuote || !calc ? (
        <p className="mt-6 text-sm tracking-wide text-zinc-600">{t("ratesStale")}</p>
      ) : (
        <>
          {/* Rate table */}
          <div className="mt-5 overflow-x-auto rounded-xl border border-white/[0.07]">
            <table className="w-full min-w-[540px] text-left text-sm">
              <thead>
                <tr className="border-b border-white/[0.06] bg-white/[0.03]">
                  <th className="px-4 py-3 text-xs font-medium uppercase tracking-[0.14em] text-zinc-500">
                    {t("comparisonColSource")}
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-[0.14em] text-zinc-500">
                    {t("comparisonColRate", { fiat: currency })}
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-[0.14em] text-zinc-500">
                    {t("comparisonColReceive", { usd: SAMPLE_USD.toLocaleString(), fiat: currency })}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.05]">
                {/* Bank retail sell */}
                <tr>
                  <td className="px-4 py-3.5 tracking-wide text-zinc-300">
                    {t("comparisonBankSell")}
                  </td>
                  <td className="px-4 py-3.5 text-right font-mono tabular-nums text-zinc-400">
                    {fmtRate(resolvedMidQuote.bankSellRatePerUsd)}
                  </td>
                  <td className="px-4 py-3.5 text-right font-mono tabular-nums text-zinc-400">
                    {fmtFiat(calc.bankSellFiatReceived)}
                  </td>
                </tr>

                {/* Exchange office */}
                <tr>
                  <td className="px-4 py-3.5 tracking-wide text-zinc-300">
                    {t("comparisonOfficeSell")}
                  </td>
                  <td className="px-4 py-3.5 text-right font-mono tabular-nums text-zinc-400">
                    {fmtRate(resolvedMidQuote.exchangeOfficeSellRatePerUsd)}
                  </td>
                  <td className="px-4 py-3.5 text-right font-mono tabular-nums text-zinc-400">
                    {fmtFiat(calc.exchangeOfficeSellFiatReceived)}
                  </td>
                </tr>

                {/* Bank buy reference */}
                <tr>
                  <td className="px-4 py-3.5 text-xs tracking-wide text-zinc-500">
                    {t("comparisonBankBuyRef")}
                  </td>
                  <td className="px-4 py-3.5 text-right font-mono text-xs tabular-nums text-zinc-500">
                    {fmtRate(resolvedMidQuote.bankBuyRatePerUsd)}
                  </td>
                  <td className="px-4 py-3.5 text-right font-mono text-xs tabular-nums text-zinc-500">
                    {fmtFiat(calc.bankBuyFiatReceived)}
                  </td>
                </tr>

                {/* ─── SMRT Smart Rate — highlighted row ─── */}
                <tr className="relative bg-emerald-500/[0.07]">
                  <td className="px-4 py-4">
                    <div className="flex flex-col gap-0.5">
                      <span className="font-semibold tracking-wide text-emerald-100">
                        {t("comparisonRroyalMid")}
                      </span>
                      <span className="text-[11px] tracking-wide text-emerald-300/70">
                        {t("comparisonFeeDisclosure", { pct: feePct })}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-right">
                    <div className="flex flex-col items-end gap-0.5">
                      <span className="font-mono font-semibold tabular-nums text-emerald-50">
                        {fmtRate(calc.effectiveRatePerUsd)}
                      </span>
                      <span className="font-mono text-[11px] tabular-nums text-emerald-300/50">
                        {t("comparisonMidRef", { rate: fmtRate(resolvedMidQuote.rroyalMidRatePerUsd) })}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-right">
                    <div className="flex flex-col items-end gap-0.5">
                      <span className="font-mono font-semibold tabular-nums text-emerald-50">
                        {fmtFiat(calc.fiatNet)}
                      </span>
                      <span className="font-mono text-[11px] tabular-nums text-emerald-400/50">
                        {t("comparisonFeeAmount", { fee: fmtFiat(calc.fiatFee), fiat: currency })}
                      </span>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* "You Save" callouts */}
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            {/* vs bank sell */}
            <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/[0.06] px-4 py-3">
              <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-zinc-500">
                {t("comparisonVsLabel", { vs: t("comparisonBankSell") })}
              </p>
              {calc.savingsVsBankSellFiat > 0 ? (
                <>
                  <p className="mt-1 text-xl font-bold tabular-nums text-emerald-300">
                    +{fmtFiat(calc.savingsVsBankSellFiat)}{" "}
                    <span className="text-sm font-medium text-emerald-400">{currency}</span>
                  </p>
                  <p className="mt-0.5 text-xs tracking-wide text-zinc-500">
                    {t("comparisonYouSavePct", { pct: calc.savingsVsBankSellPct.toFixed(2) })}
                  </p>
                </>
              ) : (
                <p className="mt-1 text-sm tracking-wide text-zinc-500">{t("comparisonAtPar")}</p>
              )}
            </div>

            {/* vs exchange office */}
            <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/[0.06] px-4 py-3">
              <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-zinc-500">
                {t("comparisonVsLabel", { vs: t("comparisonOfficeSell") })}
              </p>
              {calc.savingsVsExchangeOfficeFiat > 0 ? (
                <>
                  <p className="mt-1 text-xl font-bold tabular-nums text-emerald-300">
                    +{fmtFiat(calc.savingsVsExchangeOfficeFiat)}{" "}
                    <span className="text-sm font-medium text-emerald-400">{currency}</span>
                  </p>
                  <p className="mt-0.5 text-xs tracking-wide text-zinc-500">
                    {t("comparisonYouSavePct", { pct: calc.savingsVsExchangeOfficePct.toFixed(2) })}
                  </p>
                </>
              ) : (
                <p className="mt-1 text-sm tracking-wide text-zinc-500">{t("comparisonAtPar")}</p>
              )}
            </div>
          </div>

          {/* Compliance disclosure bar */}
          <p className="mt-3 rounded-lg border border-white/[0.05] bg-black/20 px-3 py-2 text-[11px] leading-relaxed tracking-wide text-zinc-500">
            {t("comparisonCompliance", { pct: feePct })}
          </p>
        </>
      )}
    </section>
  );
}
