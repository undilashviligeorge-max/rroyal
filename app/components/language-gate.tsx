"use client";

import { useTranslations } from "next-intl";
import { useEffect, useState, type ReactNode } from "react";

import { CosmicBackground } from "@/app/components/cosmic-background";
import { usePathname, useRouter } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";

const STORAGE_KEY = "smrt_gate_v1";
const LOCALE_COOKIE = "smrt_pref_locale";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 400;

type Locale = (typeof routing.locales)[number];

function setLocalePreferenceCookie(locale: Locale) {
  document.cookie = `${LOCALE_COOKIE}=${locale};path=/;max-age=${COOKIE_MAX_AGE};SameSite=Lax`;
}

type Props = {
  children: ReactNode;
};

export function LanguageGate({ children }: Props) {
  const t = useTranslations("LanguageGate");
  const router = useRouter();
  const pathname = usePathname();
  const [showOverlay, setShowOverlay] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    try {
      if (!window.localStorage.getItem(STORAGE_KEY)) {
        setShowOverlay(true);
      }
    } catch {
      setShowOverlay(false);
    }
  }, []);

  const dismiss = (next: Locale) => {
    try {
      window.localStorage.setItem(STORAGE_KEY, "1");
    } catch {
      /* ignore */
    }
    setLocalePreferenceCookie(next);
    setShowOverlay(false);
    router.replace(pathname, { locale: next });
  };

  if (!mounted) {
    return (
      <div
        className="relative isolate min-h-[100dvh] bg-[#050505]"
        aria-busy="true"
        aria-label={t("loading")}
      >
        <CosmicBackground nested />
      </div>
    );
  }

  if (showOverlay) {
    return (
      <div
        className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#050505] px-6"
        role="dialog"
        aria-modal="true"
        aria-labelledby="language-gate-title"
        aria-describedby="language-gate-desc"
      >
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <CosmicBackground nested />
        </div>

        <div className="relative z-[2] w-full max-w-lg">
          <div className="cosmic-glass-panel rounded-2xl px-8 py-10 text-center">
            <p
              id="language-gate-title"
              className="text-balance font-medium tracking-[0.12em] text-zinc-100 sm:text-lg"
            >
              {t("question")}
            </p>
            <p
              id="language-gate-desc"
              className="mt-3 text-balance text-sm tracking-wide text-zinc-400"
            >
              {t("subtitle")}
            </p>

            <div className="mt-10 grid gap-3 sm:grid-cols-3">
              <button
                type="button"
                onClick={() => dismiss("ka")}
                className="btn-cosmic-aura rounded-xl border border-emerald-500/25 bg-emerald-500/[0.08] px-5 py-3.5 text-sm font-medium tracking-[0.12em] text-emerald-50"
              >
                <span aria-hidden className="mr-2">
                  🇬🇪
                </span>
                {t("localKa")}
              </button>
              <button
                type="button"
                onClick={() => dismiss("en")}
                className="btn-cosmic-aura rounded-xl border border-white/10 bg-white/[0.04] px-5 py-3.5 text-sm font-medium tracking-[0.14em] text-zinc-100"
              >
                <span aria-hidden className="mr-2">
                  🇺🇸
                </span>
                {t("english")}
              </button>
              <button
                type="button"
                onClick={() => dismiss("ru")}
                className="btn-cosmic-aura rounded-xl border border-white/10 bg-white/[0.04] px-5 py-3.5 text-sm font-medium tracking-[0.14em] text-zinc-100"
              >
                <span aria-hidden className="mr-2">
                  🇷🇺
                </span>
                {t("localRu")}
              </button>
            </div>

            <p className="mt-10 text-xs tracking-wide text-zinc-600">{t("allLocalesHint")}</p>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
