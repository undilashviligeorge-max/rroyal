import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";

import { ConnectWallet } from "@/app/components/connect-wallet";
import { EscrowDashboard } from "@/app/components/escrow-dashboard";
import { OrderBook } from "@/app/components/order-book";
import { TradeBox } from "@/app/components/trade-box";
import { TransparencyPanel } from "@/app/components/transparency-panel";
import { ValueProposition } from "@/app/components/value-proposition";
import { ComparisonPanel } from "@/app/components/comparison-panel";
import { SmartRateCalculator } from "@/app/components/smart-rate-calculator";
import SmartCalculator from "@/app/components/smart-calculator";
import { Link } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { getOracleSnapshot } from "@/lib/engine/oracle";
import { regionalHubForLocale } from "@/lib/modules/regional-hub";

import { CurrencySwitcher } from "../components/currency-switcher";
import { LocaleSwitcher } from "../components/locale-switcher";
import { UsdtFiatReference } from "../components/usdt-fiat-reference";

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
  const hub = regionalHubForLocale(locale);
  const oracle = await getOracleSnapshot().catch(() => null);
  const pegNum = oracle?.rates?.[hub.pegFiat];
  const pegRateStr =
    typeof pegNum === "number" && Number.isFinite(pegNum)
      ? `${pegNum.toFixed(hub.pegFiat === "RUB" || hub.pegFiat === "USD" ? 2 : 4)} ${hub.pegFiat}`
      : hub.pegFiat === "GEL"
        ? "2.68 GEL"
        : hub.pegFiat === "RUB"
          ? "— RUB"
          : "1.00 USD";
  const bankRefLabel =
    hub.bankRefMessageKey === "hubBankRefNBG"
      ? t("hubBankRefNBG")
      : hub.bankRefMessageKey === "hubBankRefCBR"
        ? t("hubBankRefCBR")
        : t("hubBankRefComposite");

  return (
    <div className="min-h-[100dvh] text-zinc-100">
      <header className="sticky top-0 z-50 border-b border-white/[0.05] bg-[#050d14]/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <Link
            href="/"
            className="flex items-center gap-3 font-semibold tracking-[0.08em] text-zinc-100"
          >
            <span
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-emerald-500/30 bg-emerald-500/10 text-sm font-bold text-emerald-100 shadow-[0_0_20px_rgba(16,185,129,0.25)]"
              aria-hidden
            >
              S
            </span>
            <span className="text-base sm:text-lg">
              SMRT{" "}
              <span className="font-normal tracking-[0.12em] text-slate-400">/ MONEY</span>
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
        <ValueProposition />

        {/* ── Quantum Jump Calculator — hero-section, replaces old exchange form ── */}
        <div className="mx-auto mt-10 max-w-md">
          <SmartCalculator />
        </div>

        <ComparisonPanel />

        <SmartRateCalculator />

        <div className="mx-auto mt-10 max-w-md">
          <div className="cosmic-glass-panel rounded-2xl p-5 sm:p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium uppercase tracking-[0.18em] text-zinc-500">
                  {t("rateCardTitle")}
                </p>
                <UsdtFiatReference />
                <p className="mt-3 text-xs tracking-wide text-zinc-500">
                  {t("pegNoteHub", {
                    bankRef: bankRefLabel,
                    rate: pegRateStr,
                    official: t("official"),
                  })}
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
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-emerald-300/60">
              {t("orderBookBadge")}
            </p>
          </div>

          <div className="cosmic-glass-panel mb-5 rounded-xl px-4 py-4 sm:px-5">
            <p className="text-sm leading-relaxed tracking-wide text-zinc-400">
              <span className="font-medium text-zinc-200">{t("howPricingTitle")}</span>{" "}
              {t("howPricingBody")}
            </p>
          </div>

          <OrderBook rows={ORDER_ROWS} />
        </section>
      </main>

      <footer className="mt-auto border-t border-white/[0.05] bg-[#050d14]/80 py-8 backdrop-blur-sm">
        <div className="mx-auto max-w-5xl px-4 text-center text-xs tracking-wide text-zinc-600 sm:px-6">
          © {new Date().getFullYear()} {t("footer")}
        </div>
      </footer>
    </div>
  );
}
