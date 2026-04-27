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
      className="rounded-xl border border-zinc-200 bg-white p-6"
      aria-labelledby="transparency-heading"
    >
      <h2
        id="transparency-heading"
        className="text-lg font-semibold tracking-tight text-zinc-900"
      >
        {t("transparencyTitle")}
      </h2>
      <p className="mt-1 text-sm text-zinc-500">{t("transparencySubtitle")}</p>

      <div className="mt-4 rounded-lg border border-zinc-200 bg-zinc-50/80 px-4 py-3">
        <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
          {t("transparencyEscrowHeading")}
        </p>
        <p className="mt-1.5 text-sm font-medium leading-snug text-zinc-900">
          {t("transparencyEscrowBody")}
        </p>
      </div>

      <dl className="mt-5 space-y-4 border-t border-zinc-100 pt-5 text-sm">
        <div>
          <dt className="text-xs font-medium uppercase tracking-wide text-zinc-400">
            {t("transparencyNetwork")}
          </dt>
          <dd className="mt-1 flex flex-wrap items-center gap-2">
            <span className="font-medium text-zinc-900">{SEPOLIA_NAME}</span>
            <span className="rounded border border-amber-200 bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-900">
              {t("transparencyTestnet")}
            </span>
            <span className="font-mono text-xs text-zinc-600">
              chainId {SEPOLIA_CHAIN_ID}
            </span>
          </dd>
        </div>

        {geoCountry ? (
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-zinc-400">
              {t("transparencyGeo")}
            </dt>
            <dd className="mt-1 font-mono text-sm text-zinc-700">{geoCountry}</dd>
            <p className="mt-1 text-xs text-zinc-400">{t("transparencyGeoHint")}</p>
          </div>
        ) : null}

        {configured ? (
          <>
            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-zinc-400">
                {t("contractEscrow")}
              </dt>
              <dd className="mt-1 break-all font-mono text-xs leading-relaxed">
                <a
                  href={`https://sepolia.etherscan.io/address/${sepoliaContracts.escrow}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-zinc-800 underline decoration-zinc-300 underline-offset-2 hover:decoration-zinc-500"
                >
                  {sepoliaContracts.escrow}
                </a>
              </dd>
            </div>
            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-zinc-400">
                {t("contractUsdt")}
              </dt>
              <dd className="mt-1 break-all font-mono text-xs leading-relaxed">
                <a
                  href={`https://sepolia.etherscan.io/address/${sepoliaContracts.mockUsdt}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-zinc-800 underline decoration-zinc-300 underline-offset-2 hover:decoration-zinc-500"
                >
                  {sepoliaContracts.mockUsdt}
                </a>
              </dd>
            </div>
          </>
        ) : (
          <p className="text-xs text-zinc-400">{t("transparencyNoContracts")}</p>
        )}
      </dl>
    </section>
  );
}
