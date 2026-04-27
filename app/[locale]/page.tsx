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
    <div className="min-h-screen bg-[#fafafa] text-zinc-900">
      <header className="sticky top-0 z-50 border-b border-zinc-200 bg-white">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <Link
            href="/"
            className="flex items-center gap-3 font-semibold tracking-tight text-zinc-900"
          >
            <span
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-200 bg-white text-sm font-bold text-zinc-900"
              aria-hidden
            >
              R
            </span>
            <span className="text-base sm:text-lg">
              RROYAL <span className="font-normal text-zinc-500">DEX</span>
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
          <p className="text-xs font-medium uppercase tracking-widest text-zinc-500">
            {t("eyebrow")}
          </p>
          <h1 className="mt-3 text-balance text-3xl font-semibold tracking-tight text-zinc-900 sm:text-4xl">
            {t("heroTitle")}
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-zinc-600 sm:text-base">
            {t("heroSubtitle")}
          </p>
        </header>

        <div className="mx-auto mt-10 max-w-md">
          <div className="rounded-xl border border-zinc-200 bg-white p-5 sm:p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
                  {t("rateCardTitle")}
                </p>
                <UsdtFiatReference />
                <p className="mt-3 text-xs text-zinc-500">
                  {t("pegNote", { rate: OFFICIAL_RATE, official: t("official") })}
                </p>
              </div>
              <div className="shrink-0 text-right">
                <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
                  {t("rateCardLive")}
                </p>
                <p className="mt-1 max-w-[10rem] text-right text-[11px] leading-snug text-zinc-400">
                  {t("rateCardOracle")}
                </p>
              </div>
            </div>
            <p className="mt-4 border-t border-zinc-100 pt-4 text-xs leading-relaxed text-zinc-500">
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

        <section className="mt-16 border-t border-zinc-200 pt-14">
          <div className="mb-6 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-base font-semibold text-zinc-900">
                {t("orderBookTitle")}
              </h2>
              <p className="text-sm text-zinc-500">{t("orderBookSubtitle")}</p>
            </div>
            <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
              {t("orderBookBadge")}
            </p>
          </div>

          <div className="mb-5 rounded-lg border border-zinc-200 bg-white px-4 py-4 sm:px-5">
            <p className="text-sm leading-relaxed text-zinc-600">
              <span className="font-medium text-zinc-900">{t("howPricingTitle")}</span>{" "}
              {t("howPricingBody")}
            </p>
          </div>

          <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[800px] text-left text-sm">
                <thead>
                  <tr className="border-b border-zinc-100 bg-zinc-50">
                    <th className="px-4 py-3 text-xs font-medium uppercase tracking-wide text-zinc-500">
                      {t("tableSeller")}
                    </th>
                    <th className="px-4 py-3 text-xs font-medium uppercase tracking-wide text-zinc-500">
                      {t("tableAmount")}
                    </th>
                    <th className="px-4 py-3 text-xs font-medium uppercase tracking-wide text-zinc-500">
                      {t("tableRate")}
                    </th>
                    <th className="px-4 py-3 text-xs font-medium uppercase tracking-wide text-zinc-500">
                      {t("tableFee")}
                    </th>
                    <th className="px-4 py-3 text-xs font-medium uppercase tracking-wide text-zinc-500">
                      {t("tableBank")}
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wide text-zinc-500">
                      {t("tableAction")}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {ORDER_ROWS.map((row) => (
                    <tr key={`${row.seller}-${row.amount}`} className="hover:bg-zinc-50/80">
                      <td className="px-4 py-3.5 font-medium text-zinc-900">
                        {row.seller}
                      </td>
                      <td className="px-4 py-3.5 tabular-nums text-zinc-700">
                        {row.amount}
                      </td>
                      <td className="px-4 py-3.5 tabular-nums text-zinc-800">
                        {OFFICIAL_RATE}{" "}
                        <span className="text-xs font-normal text-zinc-400">
                          {t("official")}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <span
                          className={
                            row.variant === "bonus"
                              ? "inline-flex rounded border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-900"
                              : "inline-flex rounded border border-zinc-200 bg-zinc-50 px-2 py-0.5 text-xs font-medium text-zinc-700"
                          }
                        >
                          {row.platformLabel}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-zinc-600">{row.bank}</td>
                      <td className="px-4 py-3.5 text-right">
                        <button
                          type="button"
                          className="rounded-lg border border-zinc-900 bg-zinc-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-zinc-800 focus-visible:outline focus-visible:ring-2 focus-visible:ring-zinc-400 focus-visible:ring-offset-2"
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

      <footer className="mt-auto border-t border-zinc-200 bg-white py-8">
        <div className="mx-auto max-w-5xl px-4 text-center text-xs text-zinc-400 sm:px-6">
          © {new Date().getFullYear()} {t("footer")}
        </div>
      </footer>
    </div>
  );
}
