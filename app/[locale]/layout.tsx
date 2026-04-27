import { NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { cookies } from "next/headers";

import { CosmicBackground } from "@/app/components/cosmic-background";
import { DevBrowserHint } from "@/app/components/dev-browser-hint";
import { GlobalNode } from "@/app/components/global-node";
import { LanguageGate } from "@/app/components/language-gate";
import { PriceProvider } from "@/app/contexts/price-provider";
import { Providers } from "@/app/providers";
import { routing } from "@/i18n/routing";
import { getGlobalRates } from "@/lib/global-rates";

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
  const initialCurrency =
    cookieStore.get("rroyal_currency")?.value?.trim().toUpperCase() || "USD";
  const initialCountry =
    cookieStore.get("rroyal_country")?.value?.trim().toUpperCase() || null;
  const initialRates = await getGlobalRates().catch(() => null);

  const localLocale = initialCountry === "ZW" ? ("sn" as const) : ("ka" as const);

  return (
    <NextIntlClientProvider messages={messages}>
      <Providers>
        <PriceProvider
          initialCurrency={initialCurrency}
          initialCountry={initialCountry}
          initialRates={initialRates}
          locale={locale}
        >
          <div className="cosmic-root min-h-[100dvh] tracking-wide">
            <CosmicBackground />
            <LanguageGate localLocale={localLocale}>
              <>
                <GlobalNode />
                <div className="relative z-[10]">{children}</div>
              </>
            </LanguageGate>
          </div>
        </PriceProvider>
      </Providers>
      <DevBrowserHint />
    </NextIntlClientProvider>
  );
}
