import { routing } from "@/i18n/routing";

export type AppLocale = (typeof routing.locales)[number];

export type RegionalHub = {
  id: "GE" | "RU" | "INTL";
  /** next-intl `Home.*` message key for the central-bank / desk benchmark label */
  bankRefMessageKey: "hubBankRefNBG" | "hubBankRefCBR" | "hubBankRefComposite";
  /** Primary fiat used for illustrative peg line when feed has it */
  pegFiat: string;
};

const HUB_BY_LOCALE: Record<AppLocale, RegionalHub> = {
  ka: { id: "GE", bankRefMessageKey: "hubBankRefNBG", pegFiat: "GEL" },
  ru: { id: "RU", bankRefMessageKey: "hubBankRefCBR", pegFiat: "RUB" },
  en: { id: "INTL", bankRefMessageKey: "hubBankRefComposite", pegFiat: "USD" },
};

export function regionalHubForLocale(locale: string): RegionalHub {
  const l = locale as AppLocale;
  return HUB_BY_LOCALE[l] ?? HUB_BY_LOCALE.en;
}
