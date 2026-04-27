"use client";

import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";

import { isSepoliaContractsConfigured, sepoliaContracts } from "@/config/contracts";

const SEPOLIA_CHAIN_ID = 11155111;
const SEPOLIA_NAME = "Sepolia";

export function TransparencyPanel() {
  const t = useTranslations("Home");
  const [geoCountry, setGeoCountry] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/geo")
      .then((r) => r.json())
      .then((d: { country?: string | null }) => setGeoCountry(d.country ?? null))
      .catch(() => setGeoCountry(null));
  }, []);

  const configured = isSepoliaContractsConfigured();

  return (
    <section
      className="cosmic-glass-panel rounded-2xl p-6"
      aria-labelledby="transparency-heading"
    >
      <h2
        id="transparency-heading"
        className="text-lg font-semibold tracking-[0.08em] text-zinc-50"
      >
        {t("transparencyTitle")}
      </h2>
      <p className="mt-1 text-sm tracking-wide text-zinc-500">{t("transparencySubtitle")}</p>

      <div className="mt-4 rounded-xl border border-cyan-500/20 bg-cyan-500/[0.06] px-4 py-3">
        <p className="text-xs font-medium uppercase tracking-[0.16em] text-cyan-200/70">
          {t("transparencyEscrowHeading")}
        </p>
        <p className="mt-1.5 text-sm font-medium leading-snug tracking-wide text-zinc-100">
          {t("transparencyEscrowBody")}
        </p>
      </div>

      <dl className="mt-5 space-y-4 border-t border-white/[0.06] pt-5 text-sm">
        <div>
          <dt className="text-xs font-medium uppercase tracking-[0.14em] text-zinc-600">
            {t("transparencyNetwork")}
          </dt>
          <dd className="mt-1 flex flex-wrap items-center gap-2">
            <span className="font-medium tracking-wide text-zinc-200">{SEPOLIA_NAME}</span>
            <span className="rounded-lg border border-amber-400/35 bg-amber-500/10 px-2 py-0.5 text-xs font-medium tracking-wide text-amber-200">
              {t("transparencyTestnet")}
            </span>
            <span className="font-mono text-xs tracking-wide text-zinc-500">
              chainId {SEPOLIA_CHAIN_ID}
            </span>
          </dd>
        </div>

        {geoCountry ? (
          <div>
            <dt className="text-xs font-medium uppercase tracking-[0.14em] text-zinc-600">
              {t("transparencyGeo")}
            </dt>
            <dd className="mt-1 font-mono text-sm tracking-wide text-zinc-400">{geoCountry}</dd>
            <p className="mt-1 text-xs tracking-wide text-zinc-600">{t("transparencyGeoHint")}</p>
          </div>
        ) : null}

        {configured ? (
          <>
            <div>
              <dt className="text-xs font-medium uppercase tracking-[0.14em] text-zinc-600">
                {t("contractEscrow")}
              </dt>
              <dd className="mt-1 break-all font-mono text-xs leading-relaxed">
                <a
                  href={`https://sepolia.etherscan.io/address/${sepoliaContracts.escrow}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-cyan-200/90 underline decoration-cyan-500/30 underline-offset-2 hover:decoration-cyan-400/60"
                >
                  {sepoliaContracts.escrow}
                </a>
              </dd>
            </div>
            <div>
              <dt className="text-xs font-medium uppercase tracking-[0.14em] text-zinc-600">
                {t("contractUsdt")}
              </dt>
              <dd className="mt-1 break-all font-mono text-xs leading-relaxed">
                <a
                  href={`https://sepolia.etherscan.io/address/${sepoliaContracts.mockUsdt}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-cyan-200/90 underline decoration-cyan-500/30 underline-offset-2 hover:decoration-cyan-400/60"
                >
                  {sepoliaContracts.mockUsdt}
                </a>
              </dd>
            </div>
          </>
        ) : (
          <p className="text-xs tracking-wide text-zinc-600">{t("transparencyNoContracts")}</p>
        )}
      </dl>
    </section>
  );
}
