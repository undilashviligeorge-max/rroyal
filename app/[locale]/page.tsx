import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";

import { ConnectWallet } from "@/app/components/connect-wallet";
import { EscrowDashboard } from "@/app/components/escrow-dashboard";
import { TradeBox } from "@/app/components/trade-box";
import { TransparencyPanel } from "@/app/components/transparency-panel";
import { Link } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";

import { CurrencySwitcher } from "../components/currency-switcher";
import { LocaleSwitcher } from "../components/locale-switcher";
import { UsdtFiatReference } from "../components/usdt-fiat-reference";

const OFFICIAL_RATE = "2.68 GEL";

const ORDER_ROWS = [
  {
    seller: "Giorgi U.",
    amount: "1,000 USDT",
    bank: "TBC Bank",
    platformLabel: "0.2% Fee",
    variant: "fee" as const,
  },
  {
    seller: "Nino K.",
    amount: "2,500 USDT",
    bank: "Bank of Georgia",
    platformLabel: "+0.5% Bonus",
    variant: "bonus" as const,
  },
  {
    seller: "Luka M.",
    amount: "500 USDT",
    bank: "TBC Bank",
    platformLabel: "0.15% Fee",
    variant: "fee" as const,
  },
  {
    seller: "Ana T.",
    amount: "5,000 USDT",
    bank: "Liberty Bank",
    platformLabel: "+0.25% Bonus",
    variant: "bonus" as const,
  },
  {
    seller: "Davit S.",
    amount: "750 USDT",
    bank: "Credo Bank",
    platformLabel: "0.2% Fee",
    variant: "fee" as const,
  },
];

type PageProps = { params: Promise<{ locale: string }> };

export default async function Home({ params }: PageProps) {
  const { locale } = await params;
  if (!routing.locales.includes(locale as (typeof routing.locales)[number])) {
    notFound();
  }
  setRequestLocale(locale);
  const t = await getTranslations("Home");

  return (
    <div className="min-h-[100dvh] text-zinc-100">
      <header className="sticky top-0 z-50 border-b border-white/[0.06] bg-[#050505]/75 backdrop-blur-xl">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <Link
            href="/"
            className="flex items-center gap-3 font-semibold tracking-[0.08em] text-zinc-100"
          >
            <span
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-cyan-500/25 bg-cyan-500/10 text-sm font-bold text-cyan-100 shadow-[0_0_20px_rgba(34,211,238,0.2)]"
              aria-hidden
            >
              R
            </span>
            <span className="text-base sm:text-lg">
              RROYAL <span className="font-normal tracking-[0.12em] text-zinc-500">DEX</span>
            </span>
          </Link>
          <div className="flex flex-wrap items-center justify-end gap-3">
            <LocaleSwitcher />
            <CurrencySwitcher />
            <ConnectWallet />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-12 sm:px-6 sm:py-16">
        <header className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-cyan-200/70">
            {t("eyebrow")}
          </p>
          <h1 className="mt-4 text-balance text-3xl font-semibold tracking-[0.06em] text-zinc-50 sm:text-4xl">
            {t("heroTitle")}
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed tracking-wide text-zinc-400 sm:text-base">
            {t("heroSubtitle")}
          </p>
        </header>

        <div className="mx-auto mt-10 max-w-md">
          <div className="cosmic-glass-panel rounded-2xl p-5 sm:p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium uppercase tracking-[0.18em] text-zinc-500">
                  {t("rateCardTitle")}
                </p>
                <UsdtFiatReference />
                <p className="mt-3 text-xs tracking-wide text-zinc-500">
                  {t("pegNote", { rate: OFFICIAL_RATE, official: t("official") })}
                </p>
              </div>
              <div className="shrink-0 text-right">
                <p className="text-xs font-medium uppercase tracking-[0.18em] text-zinc-500">
                  {t("rateCardLive")}
                </p>
                <p className="mt-1 max-w-[10rem] text-right text-[11px] leading-snug tracking-wide text-zinc-600">
                  {t("rateCardOracle")}
                </p>
              </div>
            </div>
            <p className="mt-4 border-t border-white/[0.06] pt-4 text-xs leading-relaxed tracking-wide text-zinc-500">
              {t("rateCardFoot")}
            </p>
          </div>
        </div>

        <div className="mx-auto mt-12 max-w-md">
          <TradeBox />
        </div>

        <div className="mt-14 grid gap-6 lg:grid-cols-2">
          <EscrowDashboard />
          <TransparencyPanel />
        </div>

        <section className="mt-16 border-t border-white/[0.06] pt-14">
          <div className="mb-6 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-base font-semibold tracking-[0.08em] text-zinc-100">
                {t("orderBookTitle")}
              </h2>
              <p className="text-sm tracking-wide text-zinc-500">{t("orderBookSubtitle")}</p>
            </div>
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-cyan-200/60">
              {t("orderBookBadge")}
            </p>
          </div>

          <div className="cosmic-glass-panel mb-5 rounded-xl px-4 py-4 sm:px-5">
            <p className="text-sm leading-relaxed tracking-wide text-zinc-400">
              <span className="font-medium text-zinc-200">{t("howPricingTitle")}</span>{" "}
              {t("howPricingBody")}
            </p>
          </div>

          <div className="cosmic-glass-panel overflow-hidden rounded-xl">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[800px] text-left text-sm">
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
                  {ORDER_ROWS.map((row) => (
                    <tr key={`${row.seller}-${row.amount}`} className="hover:bg-white/[0.02]">
                      <td className="px-4 py-3.5 font-medium tracking-wide text-zinc-200">
                        {row.seller}
                      </td>
                      <td className="px-4 py-3.5 tabular-nums tracking-wide text-zinc-400">
                        {row.amount}
                      </td>
                      <td className="px-4 py-3.5 tabular-nums tracking-wide text-zinc-300">
                        {OFFICIAL_RATE}{" "}
                        <span className="text-xs font-normal tracking-wide text-zinc-600">
                          {t("official")}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <span
                          className={
                            row.variant === "bonus"
                              ? "inline-flex rounded border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-xs font-medium tracking-wide text-emerald-200"
                              : "inline-flex rounded border border-white/10 bg-white/[0.04] px-2 py-0.5 text-xs font-medium tracking-wide text-zinc-400"
                          }
                        >
                          {row.platformLabel}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 tracking-wide text-zinc-500">{row.bank}</td>
                      <td className="px-4 py-3.5 text-right">
                        <button
                          type="button"
                          className="btn-cosmic-aura rounded-lg border border-cyan-400/40 bg-cyan-500/15 px-3 py-1.5 text-xs font-medium tracking-[0.12em] text-cyan-100 focus-visible:outline focus-visible:ring-2 focus-visible:ring-cyan-400/50"
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
        </section>
      </main>

      <footer className="mt-auto border-t border-white/[0.06] bg-[#050505]/80 py-8 backdrop-blur-sm">
        <div className="mx-auto max-w-5xl px-4 text-center text-xs tracking-wide text-zinc-600 sm:px-6">
          © {new Date().getFullYear()} {t("footer")}
        </div>
      </footer>
    </div>
  );
}
