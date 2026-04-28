import { NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { cookies } from "next/headers";

import { CosmicBackground } from "@/app/components/cosmic-background";
import { DevBrowserHint } from "@/app/components/dev-browser-hint";
import { GlobalNode } from "@/app/components/global-node";
import { LanguageGate } from "@/app/components/language-gate";
import { LocaleHtmlLang } from "@/app/components/locale-html-lang";
import { PriceProvider } from "@/app/contexts/price-provider";
import { TradeIntentProvider } from "@/app/contexts/trade-intent-provider";
import { Providers } from "@/app/providers";
import { routing } from "@/i18n/routing";
import { getOracleSnapshot } from "@/lib/engine/oracle";

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;
  if (!routing.locales.includes(locale as (typeof routing.locales)[number])) {
    notFound();
  }

  setRequestLocale(locale);
  const messages = await getMessages();
  const cookieStore = await cookies();
  const rawCur = cookieStore.get("smrt_currency")?.value?.trim().toUpperCase() || "";
  const initialCurrency =
    locale === "ka"
      ? rawCur && rawCur !== "ZWG" && rawCur !== "ZWL"
        ? rawCur
        : "GEL"
      : rawCur || "USD";
  const initialCountry =
    cookieStore.get("smrt_country")?.value?.trim().toUpperCase() || null;
  const initialOracle = await getOracleSnapshot().catch(() => null);

  return (
    <NextIntlClientProvider messages={messages}>
      <Providers>
        <PriceProvider
          initialCurrency={initialCurrency}
          initialCountry={initialCountry}
          initialOracle={initialOracle}
          locale={locale}
        >
          <TradeIntentProvider>
            <LocaleHtmlLang />
            <div className="cosmic-root min-h-[100dvh] tracking-wide">
              <CosmicBackground />
              <LanguageGate>
                <>
                  <GlobalNode />
                  <div className="relative z-[10]">{children}</div>
                </>
              </LanguageGate>
            </div>
          </TradeIntentProvider>
        </PriceProvider>
      </Providers>
      <DevBrowserHint />
    </NextIntlClientProvider>
  );
}
