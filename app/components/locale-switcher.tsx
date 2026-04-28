"use client";

import { useLocale } from "next-intl";

import { Link, usePathname } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";

const LOCALE_COOKIE = "smrt_pref_locale";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 400;

function setLocalePreferenceCookie(locale: (typeof routing.locales)[number]) {
  document.cookie = `${LOCALE_COOKIE}=${locale};path=/;max-age=${COOKIE_MAX_AGE};SameSite=Lax`;
}

const LABEL: Record<(typeof routing.locales)[number], string> = {
  en: "EN",
  ka: "KA",
  ru: "RU",
};

export function LocaleSwitcher() {
  const locale = useLocale();
  const pathname = usePathname();

  return (
    <nav
      className="flex shrink-0 items-center gap-0.5 rounded-xl border border-white/10 bg-black/40 p-0.5"
      aria-label="Language"
    >
      {routing.locales.map((loc) => (
        <Link
          key={loc}
          href={pathname}
          locale={loc}
          onClick={() => setLocalePreferenceCookie(loc)}
          className={`rounded-lg px-2.5 py-1.5 text-xs font-medium tracking-[0.12em] transition ${
            loc === locale
              ? "border border-emerald-500/30 bg-emerald-500/20 text-emerald-100 shadow-[0_0_16px_rgba(34,211,238,0.15)]"
              : "text-zinc-500 hover:text-zinc-200"
          }`}
        >
          {LABEL[loc]}
        </Link>
      ))}
    </nav>
  );
}
