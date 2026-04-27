import { NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { cookies } from "next/headers";

import { DevBrowserHint } from "@/app/components/dev-browser-hint";
import { CurrencyProvider } from "@/app/contexts/currency-provider";
import { Providers } from "@/app/providers";
import { routing } from "@/i18n/routing";

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

  return (
    <NextIntlClientProvider messages={messages}>
      <Providers>
        <CurrencyProvider
          initialCurrency={initialCurrency}
          initialCountry={initialCountry}
        >
          {children}
        </CurrencyProvider>
      </Providers>
      <DevBrowserHint />
    </NextIntlClientProvider>
  );
}
