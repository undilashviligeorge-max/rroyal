"use client";

import { useTranslations } from "next-intl";
import { useEffect, useState, type ReactNode } from "react";

import { CosmicBackground } from "@/app/components/cosmic-background";
import { usePathname, useRouter } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";

const STORAGE_KEY = "rroyal_cosmic_gate_v1";

type Locale = (typeof routing.locales)[number];

type Props = {
  children: ReactNode;
  /** Secondary choice: Georgian or Shona (from region cookie) */
  localLocale: Extract<Locale, "ka" | "sn">;
};

export function LanguageGate({ children, localLocale }: Props) {
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
    setShowOverlay(false);
    router.replace(pathname, { locale: next });
  };

  const localLabel = localLocale === "sn" ? t("localSn") : t("localKa");

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
        {/* Positioned box so nested absolute cosmic layers fill the viewport */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <CosmicBackground nested />
        </div>

        <div className="relative z-[2] w-full max-w-md">
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

            <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:justify-center">
              <button
                type="button"
                onClick={() => dismiss("en")}
                className="btn-cosmic-aura rounded-xl border border-white/10 bg-white/[0.04] px-8 py-3.5 text-sm font-medium tracking-[0.14em] text-zinc-100"
              >
                {t("english")}
              </button>
              <button
                type="button"
                onClick={() => dismiss(localLocale)}
                className="btn-cosmic-aura rounded-xl border border-cyan-500/25 bg-cyan-500/[0.08] px-8 py-3.5 text-sm font-medium tracking-[0.12em] text-cyan-50"
              >
                {localLabel}
              </button>
            </div>

            <p className="mt-10 text-xs tracking-wide text-zinc-600">
              {t("allLocalesHint")}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
