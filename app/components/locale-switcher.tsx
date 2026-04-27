"use client";

import { useLocale } from "next-intl";

import { Link, usePathname } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";

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
          className={`rounded-lg px-2.5 py-1.5 text-xs font-medium tracking-[0.12em] transition ${
            loc === locale
              ? "border border-cyan-500/30 bg-cyan-500/20 text-cyan-100 shadow-[0_0_16px_rgba(34,211,238,0.15)]"
              : "text-zinc-500 hover:text-zinc-200"
          }`}
        >
          {loc === "en" ? "EN" : loc === "ka" ? "KA" : "SN"}
        </Link>
      ))}
    </nav>
  );
}
