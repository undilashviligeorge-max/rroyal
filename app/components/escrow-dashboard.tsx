"use client";

import { useTranslations } from "next-intl";

import { useCurrency } from "../contexts/currency-provider";

const MOCK_ESCROWS = [
  { id: "1042", roleKey: "escrowRowSeller" as const, usdt: "500.00", statusKey: "escrowStatusLocked" as const },
  { id: "1041", roleKey: "escrowRowBuyer" as const, usdt: "120.00", statusKey: "escrowStatusPending" as const },
  { id: "1038", roleKey: "escrowRowSeller" as const, usdt: "2,000.00", statusKey: "escrowStatusDisputed" as const },
] as const;

export function EscrowDashboard() {
  const t = useTranslations("Home");
  const { currency } = useCurrency();

  return (
    <section
      className="rounded-xl border border-zinc-200 bg-white p-6"
      aria-labelledby="escrow-dash-heading"
    >
      <div className="border-b border-zinc-100 pb-4">
        <h2
          id="escrow-dash-heading"
          className="text-lg font-semibold tracking-tight text-zinc-900"
        >
          {t("escrowDashTitle")}
        </h2>
        <p className="mt-1 text-sm text-zinc-500">{t("escrowDashSubtitle")}</p>
      </div>
      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[480px] text-left text-sm">
          <thead>
            <tr className="border-b border-zinc-100 text-xs font-medium uppercase tracking-wide text-zinc-400">
              <th className="py-2 pr-3 font-medium">{t("escrowColId")}</th>
              <th className="py-2 pr-3 font-medium">{t("escrowColRole")}</th>
              <th className="py-2 pr-3 font-medium">{t("escrowColUsdt")}</th>
              <th className="py-2 pr-3 font-medium">{t("escrowColFiat")}</th>
              <th className="py-2 font-medium">{t("escrowColStatus")}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {MOCK_ESCROWS.map((row) => (
              <tr key={row.id} className="text-zinc-800">
                <td className="py-3 pr-3 font-mono text-xs text-zinc-600">
                  #{row.id}
                </td>
                <td className="py-3 pr-3">{t(row.roleKey)}</td>
                <td className="py-3 pr-3 font-mono tabular-nums">{row.usdt}</td>
                <td className="py-3 pr-3 font-mono text-xs tabular-nums text-zinc-600">
                  {t("escrowFiatDemo", { code: currency })}
                </td>
                <td className="py-3">
                  <span className="rounded border border-zinc-200 bg-zinc-50 px-2 py-0.5 text-xs font-medium text-zinc-700">
                    {t(row.statusKey)}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-4 text-xs leading-relaxed text-zinc-400">{t("escrowDashNote")}</p>
    </section>
  );
}
