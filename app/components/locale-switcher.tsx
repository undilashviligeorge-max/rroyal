"use client";

import { useLocale } from "next-intl";

import { Link, usePathname } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";

export function LocaleSwitcher() {
  const locale = useLocale();
  const pathname = usePathname();

  return (
    <nav
      className="flex shrink-0 items-center gap-0.5 rounded-lg border border-zinc-200 bg-white p-0.5"
      aria-label="Language"
    >
      {routing.locales.map((loc) => (
        <Link
          key={loc}
          href={pathname}
          locale={loc}
          className={`rounded-md px-2.5 py-1.5 text-xs font-medium ${
            loc === locale
              ? "bg-zinc-900 text-white"
              : "text-zinc-500 hover:text-zinc-900"
          }`}
        >
          {loc === "en" ? "EN" : loc === "ka" ? "KA" : "SN"}
        </Link>
      ))}
    </nav>
  );
}
