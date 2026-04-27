"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";

import { useCurrency } from "../contexts/currency-provider";

type Side = "buy" | "sell";

export function TradeBox() {
  const t = useTranslations("Home");
  const { currency, usdtInFiat, loading } = useCurrency();
  const [side, setSide] = useState<Side>("buy");
  const [usdtAmount, setUsdtAmount] = useState("");

  const pair = `${currency}/USDT`;

  return (
    <section
      className="rounded-xl border border-zinc-200 bg-white p-6 sm:p-8"
      aria-labelledby="trade-box-heading"
    >
      <div className="flex flex-col gap-1 border-b border-zinc-100 pb-4">
        <h2
          id="trade-box-heading"
          className="text-lg font-semibold tracking-tight text-zinc-900"
        >
          {t("tradeBoxTitle")}
        </h2>
        <p className="text-sm text-zinc-500">{t("tradeBoxSubtitle", { pair })}</p>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-1 rounded-lg border border-zinc-200 bg-zinc-50/80 p-1">
        <button
          type="button"
          onClick={() => setSide("buy")}
          className={`rounded-md py-2.5 text-sm font-medium transition ${
            side === "buy"
              ? "bg-white text-zinc-900 shadow-sm ring-1 ring-zinc-200/80"
              : "text-zinc-500 hover:text-zinc-800"
          }`}
        >
          {t("tradeBuy")}
        </button>
        <button
          type="button"
          onClick={() => setSide("sell")}
          className={`rounded-md py-2.5 text-sm font-medium transition ${
            side === "sell"
              ? "bg-white text-zinc-900 shadow-sm ring-1 ring-zinc-200/80"
              : "text-zinc-500 hover:text-zinc-800"
          }`}
        >
          {t("tradeSell")}
        </button>
      </div>

      <div className="mt-6 space-y-4">
        <div>
          <label
            htmlFor="trade-usdt"
            className="block text-xs font-medium uppercase tracking-wide text-zinc-500"
          >
            {t("tradeAmountUsdt")}
          </label>
          <input
            id="trade-usdt"
            type="text"
            inputMode="decimal"
            autoComplete="off"
            placeholder="0.00"
            value={usdtAmount}
            onChange={(e) => setUsdtAmount(e.target.value)}
            className="mt-1.5 w-full rounded-lg border border-zinc-200 bg-zinc-50/50 px-3 py-2.5 font-mono text-sm text-zinc-900 tabular-nums placeholder:text-zinc-400 focus:border-zinc-400 focus:bg-white focus:outline-none"
          />
        </div>
        <div className="rounded-lg border border-dashed border-zinc-200 bg-zinc-50/40 px-3 py-2.5">
          <p className="text-[11px] font-medium uppercase tracking-wide text-zinc-400">
            {t("tradeYouSee")}
          </p>
          <p className="mt-1 text-sm text-zinc-700">
            {side === "buy" ? t("tradeBuyExplain") : t("tradeSellExplain")}
          </p>
          <p className="mt-2 font-mono text-xs text-zinc-600">
            {loading
              ? t("ratesStale")
              : usdtInFiat != null
                ? t("tradeReference", {
                    side: side === "buy" ? t("tradeBuy") : t("tradeSell"),
                    fiat: currency,
                    rate: usdtInFiat.toLocaleString(undefined, {
                      maximumFractionDigits: 4,
                    }),
                  })
                : "—"}
          </p>
        </div>
        <button
          type="button"
          disabled
          className="w-full rounded-lg border border-zinc-200 bg-zinc-900 py-3 text-sm font-medium text-white opacity-90"
          title={t("tradeComingSoon")}
        >
          {t("tradeCta")}
        </button>
        <p className="text-center text-[11px] leading-relaxed text-zinc-400">
          {t("tradeDisclaimer")}
        </p>
      </div>
    </section>
  );
}
