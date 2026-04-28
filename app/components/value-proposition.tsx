"use client";

import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";

import { useCurrency } from "../contexts/price-provider";

export function ValueProposition() {
  const t = useTranslations("Home");
  const { currency, compareBenchmarksAt } = useCurrency();
  const [amount, setAmount] = useState(1000);

  const bench = useMemo(() => compareBenchmarksAt(amount), [amount, compareBenchmarksAt]);

  const saveBank =
    bench != null && bench.savingsVsBankAbsolute > 0 ? bench.savingsVsBankAbsolute.toFixed(2) : "—";
  const saveOffice =
    bench != null && bench.savingsVsExchangeOfficeAbsolute > 0
      ? bench.savingsVsExchangeOfficeAbsolute.toFixed(2)
      : "—";

  return (
    <section className="mx-auto max-w-4xl text-center">
      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-emerald-200/80">
        {t("valueHeroEyebrow")}
      </p>
      <h1 className="mt-3 whitespace-pre-line text-balance text-4xl font-bold tracking-[0.02em] text-zinc-50 sm:text-5xl">
        {t("valueHeroTitle")}
      </h1>
      <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed tracking-wide text-zinc-400 sm:text-base">
        {t("valueHeroSubtitle")}
      </p>

      <div className="mt-8 grid gap-3 text-left sm:grid-cols-3">
        <div className="cosmic-glass-panel rounded-xl p-4">
          <p className="text-xl">🏦</p>
          <h3 className="mt-1 text-sm font-semibold tracking-wide text-zinc-100">{t("valueCard1Title")}</h3>
          <p className="mt-1 text-xs leading-relaxed tracking-wide text-zinc-500">{t("valueCard1Body")}</p>
        </div>
        <div className="cosmic-glass-panel rounded-xl p-4">
          <p className="text-xl">⚡</p>
          <h3 className="mt-1 text-sm font-semibold tracking-wide text-zinc-100">{t("valueCard2Title")}</h3>
          <p className="mt-1 text-xs leading-relaxed tracking-wide text-zinc-500">{t("valueCard2Body")}</p>
        </div>
        <div className="cosmic-glass-panel rounded-xl p-4">
          <p className="text-xl">🌍</p>
          <h3 className="mt-1 text-sm font-semibold tracking-wide text-zinc-100">{t("valueCard3Title")}</h3>
          <p className="mt-1 text-xs leading-relaxed tracking-wide text-zinc-500">{t("valueCard3Body")}</p>
        </div>
      </div>

      <div className="cosmic-glass-panel mt-6 rounded-2xl p-4 text-left sm:p-5">
        <p className="text-xs uppercase tracking-[0.18em] text-zinc-500">{t("valueCalcTitle")}</p>
        <p className="mt-2 text-sm tracking-wide text-zinc-400">
          {t("valueCalcIntro", { amount: amount.toLocaleString(), fiat: currency })}
        </p>
        <ul className="mt-3 space-y-2 text-sm tracking-wide text-zinc-300">
          <li className="flex flex-wrap gap-x-2 border-l-2 border-emerald-500/40 pl-3">
            <span className="text-zinc-500">{t("valueCalcVsBankLabel")}</span>
            <span className="font-medium tabular-nums text-emerald-100">
              {saveBank !== "—" ? t("valueCalcSaveAmount", { save: saveBank, fiat: currency }) : "—"}
            </span>
          </li>
          <li className="flex flex-wrap gap-x-2 border-l-2 border-emerald-500/35 pl-3">
            <span className="text-zinc-500">{t("valueCalcVsBoothLabel")}</span>
            <span className="font-medium tabular-nums text-emerald-100">
              {saveOffice !== "—"
                ? t("valueCalcSaveAmount", { save: saveOffice, fiat: currency })
                : "—"}
            </span>
          </li>
        </ul>
        <p className="mt-4 text-xs leading-relaxed tracking-wide text-zinc-500">{t("valueCalcTagline")}</p>
        <input
          type="range"
          min={100}
          max={10000}
          step={100}
          value={amount}
          onChange={(e) => setAmount(Number(e.target.value))}
          className="mt-4 w-full accent-emerald-400"
          aria-label={t("valueCalcSliderAria")}
        />
      </div>
    </section>
  );
}
