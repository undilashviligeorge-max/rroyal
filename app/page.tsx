import Link from "next/link";

import { isSepoliaContractsConfigured, sepoliaContracts } from "@/config/contracts";

import { ConnectWallet } from "./components/connect-wallet";

const OFFICIAL_RATE = "2.68 GEL";

const ORDER_ROWS = [
  {
    seller: "Giorgi U.",
    amount: "1,000 USDT",
    bank: "TBC Bank",
    platformLabel: "0.2% Fee",
    variant: "fee" as const,
  },
  {
    seller: "Nino K.",
    amount: "2,500 USDT",
    bank: "Bank of Georgia",
    platformLabel: "+0.5% Bonus",
    variant: "bonus" as const,
  },
  {
    seller: "Luka M.",
    amount: "500 USDT",
    bank: "TBC Bank",
    platformLabel: "0.15% Fee",
    variant: "fee" as const,
  },
  {
    seller: "Ana T.",
    amount: "5,000 USDT",
    bank: "Liberty Bank",
    platformLabel: "+0.25% Bonus",
    variant: "bonus" as const,
  },
  {
    seller: "Davit S.",
    amount: "750 USDT",
    bank: "Credo Bank",
    platformLabel: "0.2% Fee",
    variant: "fee" as const,
  },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-[#f6f8fa] text-zinc-900">
      <header className="sticky top-0 z-50 border-b border-zinc-200/80 bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link
            href="/"
            className="flex items-center gap-2.5 font-semibold tracking-tight text-zinc-900"
          >
            <span
              className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-sky-500 to-emerald-500 text-sm font-bold text-white shadow-sm"
              aria-hidden
            >
              R
            </span>
            <span className="text-lg">
              RROYAL <span className="font-medium text-zinc-400">DEX</span>
            </span>
          </Link>
          <ConnectWallet />
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 pb-20 pt-14 sm:px-6 lg:px-8 lg:pt-20">
        <section className="mx-auto max-w-3xl text-center">
          <p className="mb-4 text-sm font-medium uppercase tracking-widest text-sky-600">
            Zero-spread · USDT ↔ GEL
          </p>
          <h1 className="text-balance text-4xl font-semibold tracking-tight text-zinc-900 sm:text-5xl sm:leading-tight">
            Trade USDT Safely at National Bank Rates
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-lg leading-relaxed text-zinc-500">
            Zero-spread, national bank rate trading — matched with verified
            counterparties and settled through local banks.
          </p>

          <div className="mx-auto mt-8 max-w-md">
            <div className="rounded-xl border border-zinc-200/90 bg-white px-5 py-4 text-left shadow-sm ring-1 ring-zinc-900/[0.03]">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
                    Current national bank rate
                  </p>
                  <p className="mt-1.5 font-mono text-lg font-semibold tracking-tight text-zinc-900 sm:text-xl">
                    1 USD = 2.68 GEL
                  </p>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-1">
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200/80 bg-emerald-50/90 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-emerald-800">
                    <span className="relative flex h-2 w-2">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
                      <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.6)]" />
                    </span>
                    Live
                  </span>
                  <p className="max-w-[9rem] text-right text-[10px] leading-snug text-zinc-400">
                    via Chainlink Oracle
                  </p>
                </div>
              </div>
              <div className="mt-3 flex items-center gap-2 border-t border-zinc-100 pt-3">
                <svg
                  className="h-4 w-4 shrink-0 text-emerald-600"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  aria-hidden
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
                    clipRule="evenodd"
                  />
                </svg>
                <p className="text-xs leading-relaxed text-zinc-500">
                  Rate feed attested on-chain for every fill — same figure the
                  desk uses for settlement.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-16 lg:mt-20">
          <div className="mb-6 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-zinc-900">
                P2P order book
              </h2>
              <p className="text-sm text-zinc-500">
                Live offers from the community — demo data for preview.
              </p>
            </div>
            <p className="text-xs font-medium uppercase tracking-wide text-emerald-600">
              Escrow &amp; bank transfer
            </p>
          </div>

          <div className="mb-5 rounded-xl border border-sky-200/60 bg-gradient-to-br from-sky-50/80 to-white px-4 py-3.5 shadow-sm sm:px-5">
            <div className="flex gap-3 sm:items-center">
              <div
                className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-sky-100 text-sky-700"
                aria-hidden
              >
                <svg
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z"
                  />
                </svg>
              </div>
              <p className="text-sm leading-relaxed text-zinc-700">
                <span className="font-medium text-zinc-900">
                  How pricing works.
                </span>{" "}
                All trades are locked at the official National Bank rate. Zero
                spread. Dynamic platform fees ensure instant liquidity.
              </p>
            </div>
          </div>

          <div className="overflow-hidden rounded-xl border border-zinc-200/80 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[860px] text-left text-sm">
                <thead>
                  <tr className="border-b border-zinc-100 bg-zinc-50/80">
                    <th className="px-5 py-3.5 font-medium text-zinc-500">
                      Seller
                    </th>
                    <th className="px-5 py-3.5 font-medium text-zinc-500">
                      Amount
                    </th>
                    <th className="px-5 py-3.5 font-medium text-zinc-500">
                      Rate
                    </th>
                    <th className="px-5 py-3.5 font-medium text-zinc-500">
                      Platform fee / bonus
                    </th>
                    <th className="px-5 py-3.5 font-medium text-zinc-500">
                      Bank
                    </th>
                    <th className="px-5 py-3.5 text-right font-medium text-zinc-500">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {ORDER_ROWS.map((row) => (
                    <tr
                      key={`${row.seller}-${row.amount}`}
                      className="transition-colors hover:bg-zinc-50/60"
                    >
                      <td className="px-5 py-4 font-medium text-zinc-900">
                        {row.seller}
                      </td>
                      <td className="px-5 py-4 tabular-nums text-zinc-700">
                        {row.amount}
                      </td>
                      <td className="px-5 py-4 tabular-nums text-zinc-800">
                        {OFFICIAL_RATE}{" "}
                        <span className="text-xs font-medium text-zinc-400">
                          (Official)
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className={
                            row.variant === "bonus"
                              ? "inline-flex rounded-md bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700 ring-1 ring-inset ring-emerald-200/80"
                              : "inline-flex rounded-md bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-600 ring-1 ring-inset ring-zinc-200/80"
                          }
                        >
                          {row.platformLabel}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-zinc-600">{row.bank}</td>
                      <td className="px-5 py-4 text-right">
                        <button
                          type="button"
                          className="inline-flex items-center justify-center rounded-md border border-emerald-200/90 bg-emerald-50/80 px-3.5 py-2 text-xs font-semibold text-emerald-800 shadow-sm transition hover:border-emerald-300 hover:bg-emerald-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-500"
                        >
                          Buy USDT
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-zinc-200/80 bg-white py-8">
        <div className="mx-auto max-w-6xl px-4 text-center text-xs text-zinc-400 sm:px-6 lg:px-8">
          {isSepoliaContractsConfigured() ? (
            <div className="mx-auto mb-6 max-w-2xl rounded-lg border border-zinc-200 bg-zinc-50/80 px-4 py-4 text-left sm:px-5">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-zinc-500">
                Live Sepolia contracts
              </p>
              <dl className="mt-3 space-y-2 font-mono text-[11px] leading-relaxed text-zinc-700">
                <div>
                  <dt className="text-zinc-500">Escrow</dt>
                  <dd>
                    <a
                      href={`https://sepolia.etherscan.io/address/${sepoliaContracts.escrow}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="break-all text-sky-700 underline decoration-sky-200 underline-offset-2 hover:text-sky-900"
                    >
                      {sepoliaContracts.escrow}
                    </a>
                  </dd>
                </div>
                <div>
                  <dt className="text-zinc-500">Mock USDT</dt>
                  <dd>
                    <a
                      href={`https://sepolia.etherscan.io/address/${sepoliaContracts.mockUsdt}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="break-all text-sky-700 underline decoration-sky-200 underline-offset-2 hover:text-sky-900"
                    >
                      {sepoliaContracts.mockUsdt}
                    </a>
                  </dd>
                </div>
              </dl>
            </div>
          ) : null}
          © {new Date().getFullYear()} RROYAL DEX · Preview interface
        </div>
      </footer>
    </div>
  );
}
