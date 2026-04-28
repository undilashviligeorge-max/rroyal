"use client";

import { useTranslations } from "next-intl";
import { useMemo } from "react";

import { useCurrency } from "../contexts/price-provider";
import { useTradeIntent } from "../contexts/trade-intent-provider";

type Row = {
  seller: string;
  amount: string;
  bank: string;
  platformLabel: string;
  variant: "fee" | "bonus";
};

function parseAmount(raw: string): number {
  return Number(raw.replace(/[^\d.]/g, "")) || 0;
}

export function OrderBook({ rows }: { rows: Row[] }) {
  const t = useTranslations("Home");
  const { currency, resolvedMidQuote, compareBankVsRroyalAt } = useCurrency();
  const { lockFromOrderBook } = useTradeIntent();

  const rowsWithSavings = useMemo(
    () =>
      rows.map((row) => {
        const usdt = parseAmount(row.amount);
        const cmp = usdt > 0 ? compareBankVsRroyalAt(usdt) : null;
        const savings =
          cmp != null && cmp.savingsAbsolute > 0 ? cmp.savingsAbsolute : 0;
        return { ...row, usdt, savings };
      }),
    [rows, compareBankVsRroyalAt]
  );

  const midDisplay = resolvedMidQuote?.rroyalMidRatePerUsd;

  return (
    <div className="cosmic-glass-panel overflow-hidden rounded-xl">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[860px] text-left text-sm">
          <thead>
            <tr className="border-b border-white/[0.06] bg-white/[0.03]">
              <th className="px-4 py-3 text-xs font-medium uppercase tracking-[0.14em] text-zinc-500">
                {t("tableSeller")}
              </th>
              <th className="px-4 py-3 text-xs font-medium uppercase tracking-[0.14em] text-zinc-500">
                {t("tableAmount")}
              </th>
              <th className="px-4 py-3 text-xs font-medium uppercase tracking-[0.14em] text-zinc-500">
                {t("tableRate")}
              </th>
              <th className="px-4 py-3 text-xs font-medium uppercase tracking-[0.14em] text-zinc-500">
                {t("tableFee")}
              </th>
              <th className="px-4 py-3 text-xs font-medium uppercase tracking-[0.14em] text-zinc-500">
                {t("tableBank")}
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-[0.14em] text-zinc-500">
                {t("tableAction")}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.05]">
            {rowsWithSavings.map((row) => (
              <tr key={`${row.seller}-${row.amount}`} className="hover:bg-white/[0.02]">
                <td className="px-4 py-3.5 font-medium tracking-wide text-zinc-200">
                  {row.seller}
                </td>
                <td className="px-4 py-3.5 tabular-nums tracking-wide text-zinc-400">{row.amount}</td>
                <td className="px-4 py-3.5 tabular-nums tracking-wide text-zinc-300">
                  {midDisplay != null ? `${midDisplay.toFixed(4)} ${currency}` : "—"}
                </td>
                <td className="px-4 py-3.5">
                  <div className="flex flex-col gap-1">
                    <span
                      className={
                        row.variant === "bonus"
                          ? "inline-flex w-fit rounded border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-xs font-medium tracking-wide text-emerald-200"
                          : "inline-flex w-fit rounded border border-white/10 bg-white/[0.04] px-2 py-0.5 text-xs font-medium tracking-wide text-zinc-400"
                      }
                    >
                      {row.platformLabel}
                    </span>
                    {row.savings > 0 ? (
                      <span className="inline-flex w-fit rounded border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium tracking-wide text-emerald-100">
                        {t("orderBookSavings", { amount: row.savings.toFixed(2), fiat: currency })}
                      </span>
                    ) : null}
                  </div>
                </td>
                <td className="px-4 py-3.5 tracking-wide text-zinc-500">{row.bank}</td>
                <td className="px-4 py-3.5 text-right">
                  <button
                    type="button"
                    onClick={() =>
                      lockFromOrderBook({
                        currency,
                        lockedRate: midDisplay ?? 0,
                        amountUsdt: row.usdt,
                      })
                    }
                    className="inline-flex rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-xs font-medium tracking-wide text-emerald-100 transition hover:bg-emerald-500/15"
                  >
                    {t("buyUsdt")}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
