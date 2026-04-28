"use client";

import { useFormatter, useTranslations } from "next-intl";
import { useMemo, useState } from "react";

import { PLATFORM_FEE_PCT } from "@/lib/engine/smart-rate";

import { getRateFractionDigits, useCurrency } from "../contexts/price-provider";

const PRESETS = [100, 500, 1000, 5000];

export function SmartRateCalculator() {
  const t = useTranslations("Home");
  const format = useFormatter();
  const { currency, calcSmartRateAt, resolvedMidQuote, loading } = useCurrency();
  const [amountStr, setAmountStr] = useState("1000");

  const amount = useMemo(() => {
    const n = Number(amountStr.replace(/[^\d.]/g, ""));
    return Number.isFinite(n) && n > 0 ? n : 0;
  }, [amountStr]);

  const calc = useMemo(
    () => (amount > 0 ? calcSmartRateAt(amount) : null),
    [amount, calcSmartRateAt]
  );

  const fmtFiat = (v: number) =>
    format.number(v, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const fmtRate = (v: number) =>
    format.number(v, {
      minimumFractionDigits: 4,
      maximumFractionDigits: getRateFractionDigits(currency, v),
    });

  const feePct = (PLATFORM_FEE_PCT * 100).toFixed(1);

  return (
    <section
      className="cosmic-glass-panel mt-10 rounded-2xl p-5 sm:p-6"
      aria-labelledby="calc-heading"
    >
      {/* Header */}
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-400/80">
        {t("calcEyebrow")}
      </p>
      <h2
        id="calc-heading"
        className="mt-1 text-lg font-bold tracking-[0.04em] text-zinc-50 sm:text-xl"
      >
        {t("calcTitle")}
      </h2>
      <p className="mt-1 text-xs leading-relaxed tracking-wide text-zinc-500">
        {t("calcSubtitle")}
      </p>

      {/* Amount input */}
      <div className="mt-5">
        <label className="text-xs font-medium uppercase tracking-[0.16em] text-zinc-500">
          {t("calcInputLabel")}
        </label>
        <div className="mt-2 flex gap-2">
          <div className="relative flex-1">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 font-mono text-sm text-zinc-500">
              $
            </span>
            <input
              type="text"
              inputMode="decimal"
              value={amountStr}
              onChange={(e) => setAmountStr(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-black/40 pl-7 pr-4 py-2.5 font-mono text-sm tracking-wide text-zinc-100 placeholder:text-zinc-600 focus:border-emerald-500/40 focus:outline-none focus:ring-1 focus:ring-emerald-500/30"
              placeholder="1000"
              aria-label={t("calcInputAriaLabel")}
            />
          </div>
          <span className="flex items-center rounded-xl border border-white/10 bg-black/30 px-3 text-sm font-medium tracking-wide text-zinc-400">
            USD
          </span>
        </div>

        {/* Quick presets */}
        <div className="mt-2 flex flex-wrap gap-1.5">
          {PRESETS.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setAmountStr(String(p))}
              className={`rounded-lg border px-2.5 py-1 text-xs font-medium tracking-wide transition ${
                amount === p
                  ? "border-emerald-500/40 bg-emerald-500/15 text-emerald-100"
                  : "border-white/10 bg-white/[0.04] text-zinc-500 hover:text-zinc-200"
              }`}
            >
              ${p.toLocaleString()}
            </button>
          ))}
        </div>
      </div>

      {/* Results */}
      {loading ? (
        <p className="mt-6 text-sm tracking-wide text-zinc-600">{t("ratesStale")}</p>
      ) : !resolvedMidQuote || !calc ? (
        <p className="mt-6 text-sm tracking-wide text-zinc-600">{t("calcEnterAmount")}</p>
      ) : (
        <>
          {/* Primary output */}
          <div className="mt-6 rounded-xl border border-emerald-500/25 bg-emerald-500/[0.06] px-5 py-4">
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-emerald-400/70">
              {t("calcYouReceive")}
            </p>
            <p className="mt-2 text-3xl font-bold tabular-nums tracking-tight text-emerald-100 sm:text-4xl">
              {fmtFiat(calc.fiatNet)}{" "}
              <span className="text-lg font-medium text-emerald-400">{currency}</span>
            </p>
            <p className="mt-1 font-mono text-xs tabular-nums text-zinc-500">
              {t("calcSmartRateLine", {
                rate: fmtRate(calc.effectiveRatePerUsd),
                fiat: currency,
              })}
            </p>
          </div>

          {/* Fee disclosure — always visible, high contrast */}
          <div className="mt-3 flex flex-wrap items-center gap-2 rounded-xl border border-amber-400/20 bg-amber-500/[0.06] px-4 py-2.5">
            <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-amber-300/80">
              <svg
                className="h-3 w-3 shrink-0"
                viewBox="0 0 16 16"
                fill="none"
                aria-hidden
              >
                <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5" />
                <path d="M8 5v4M8 11v.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              {t("calcFeeDisclosureLabel")}
            </span>
            <span className="text-[11px] tracking-wide text-zinc-400">
              {t("calcFeeDisclosureDetail", {
                fee: fmtFiat(calc.fiatFee),
                fiat: currency,
                pct: feePct,
                gross: fmtFiat(calc.fiatGross),
              })}
            </span>
          </div>

          {/* Breakdown rows */}
          <div className="mt-5 space-y-2.5">
            <p className="text-xs font-medium uppercase tracking-[0.16em] text-zinc-500">
              {t("calcBreakdownTitle")}
            </p>

            {/* At mid-point (before fee) */}
            <div className="flex items-center justify-between rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2.5">
              <span className="text-xs tracking-wide text-zinc-400">{t("calcRowMid")}</span>
              <span className="font-mono text-sm tabular-nums text-zinc-200">
                {fmtFiat(calc.fiatGross)} {currency}
              </span>
            </div>

            {/* Platform fee */}
            <div className="flex items-center justify-between rounded-lg border border-amber-400/15 bg-amber-500/[0.04] px-3 py-2.5">
              <span className="text-xs tracking-wide text-zinc-400">
                {t("calcRowFee", { pct: feePct })}
              </span>
              <span className="font-mono text-sm tabular-nums text-amber-300/90">
                −{fmtFiat(calc.fiatFee)} {currency}
              </span>
            </div>

            {/* Net */}
            <div className="flex items-center justify-between rounded-lg border border-emerald-500/25 bg-emerald-500/[0.06] px-3 py-2.5">
              <span className="text-xs font-semibold tracking-wide text-emerald-200">
                {t("calcRowNet")}
              </span>
              <span className="font-mono text-sm font-semibold tabular-nums text-emerald-100">
                {fmtFiat(calc.fiatNet)} {currency}
              </span>
            </div>
          </div>

          {/* Savings comparison */}
          <div className="mt-5 grid gap-2 sm:grid-cols-2">
            {/* vs bank sell */}
            <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/[0.05] px-4 py-3">
              <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-zinc-500">
                {t("calcSavingsVsBankLabel")}
              </p>
              {calc.savingsVsBankSellFiat > 0 ? (
                <p className="mt-1.5 text-xl font-bold tabular-nums text-emerald-300">
                  +{fmtFiat(calc.savingsVsBankSellFiat)}{" "}
                  <span className="text-sm font-medium text-emerald-400">{currency}</span>
                </p>
              ) : (
                <p className="mt-1.5 text-sm tracking-wide text-zinc-500">
                  {t("comparisonAtPar")}
                </p>
              )}
            </div>

            {/* vs exchange office */}
            <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/[0.05] px-4 py-3">
              <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-zinc-500">
                {t("calcSavingsVsOfficeLabel")}
              </p>
              {calc.savingsVsExchangeOfficeFiat > 0 ? (
                <p className="mt-1.5 text-xl font-bold tabular-nums text-emerald-300">
                  +{fmtFiat(calc.savingsVsExchangeOfficeFiat)}{" "}
                  <span className="text-sm font-medium text-emerald-400">{currency}</span>
                </p>
              ) : (
                <p className="mt-1.5 text-sm tracking-wide text-zinc-500">
                  {t("comparisonAtPar")}
                </p>
              )}
            </div>
          </div>

          {/* Rate reference line */}
          <p className="mt-4 text-[11px] leading-relaxed tracking-wide text-zinc-600">
            {t("calcRateRef", {
              mid: fmtRate(resolvedMidQuote.rroyalMidRatePerUsd),
              effective: fmtRate(calc.effectiveRatePerUsd),
              bank: fmtRate(resolvedMidQuote.bankSellRatePerUsd),
              fiat: currency,
            })}
          </p>
        </>
      )}
    </section>
  );
}
