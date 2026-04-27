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
      className="cosmic-glass-panel rounded-2xl p-6 sm:p-8"
      aria-labelledby="trade-box-heading"
    >
      <div className="flex flex-col gap-1 border-b border-white/[0.06] pb-4">
        <h2
          id="trade-box-heading"
          className="text-lg font-semibold tracking-[0.08em] text-zinc-50"
        >
          {t("tradeBoxTitle")}
        </h2>
        <p className="text-sm tracking-wide text-zinc-500">
          {t("tradeBoxSubtitle", { pair })}
        </p>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-1 rounded-xl border border-white/[0.08] bg-black/30 p-1">
        <button
          type="button"
          onClick={() => setSide("buy")}
          className={`rounded-lg py-2.5 text-sm font-medium tracking-wide transition ${
            side === "buy"
              ? "border border-cyan-500/30 bg-cyan-500/15 text-cyan-50 shadow-[0_0_20px_rgba(34,211,238,0.12)]"
              : "text-zinc-500 hover:text-zinc-300"
          }`}
        >
          {t("tradeBuy")}
        </button>
        <button
          type="button"
          onClick={() => setSide("sell")}
          className={`rounded-lg py-2.5 text-sm font-medium tracking-wide transition ${
            side === "sell"
              ? "border border-cyan-500/30 bg-cyan-500/15 text-cyan-50 shadow-[0_0_20px_rgba(34,211,238,0.12)]"
              : "text-zinc-500 hover:text-zinc-300"
          }`}
        >
          {t("tradeSell")}
        </button>
      </div>

      <div className="mt-6 space-y-4">
        <div>
          <label
            htmlFor="trade-usdt"
            className="block text-xs font-medium uppercase tracking-[0.16em] text-zinc-500"
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
            className="mt-1.5 w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2.5 font-mono text-sm tracking-wide text-zinc-100 tabular-nums placeholder:text-zinc-600 focus:border-cyan-500/40 focus:outline-none focus:ring-1 focus:ring-cyan-500/30"
          />
        </div>
        <div className="rounded-xl border border-dashed border-white/[0.08] bg-white/[0.02] px-3 py-2.5">
          <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-zinc-600">
            {t("tradeYouSee")}
          </p>
          <p className="mt-1 text-sm tracking-wide text-zinc-400">
            {side === "buy" ? t("tradeBuyExplain") : t("tradeSellExplain")}
          </p>
          <p className="mt-2 font-mono text-xs tracking-wide text-cyan-200/80">
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
          className="w-full rounded-xl border border-white/10 bg-zinc-100/90 py-3 text-sm font-medium tracking-[0.1em] text-zinc-950 opacity-90"
          title={t("tradeComingSoon")}
        >
          {t("tradeCta")}
        </button>
        <p className="text-center text-[11px] leading-relaxed tracking-wide text-zinc-600">
          {t("tradeDisclaimer")}
        </p>
      </div>
    </section>
  );
}
