"use client";

import { useConnectModal } from "@rainbow-me/rainbowkit";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { isAddress, parseEventLogs } from "viem";
import { sepolia } from "wagmi/chains";
import {
  useAccount,
  useChainId,
  useSwitchChain,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi";

import { isSepoliaContractsConfigured, sepoliaContracts } from "@/config/contracts";
import { rroyalEscrowAbi } from "@/config/rroyal-escrow-abi";

import {
  applyOnChainTradeCreated,
  createInitiatedSession,
  type TradeLifecycleSession,
} from "@/lib/engine/trade-lifecycle";
import { ESCROW_WORKFLOW_ORDER, type EscrowWorkflowState } from "@/lib/modules/escrow-workflow-engine";

import { RateTrustBadge } from "./rate-trust-badge";
import { getRateFractionDigits, useCurrency } from "../contexts/price-provider";
import { useTradeIntent } from "../contexts/trade-intent-provider";

type Side = "buy" | "sell";
type PricingMode = "linked" | "fixed";

function parseUsdtToMicroUnits(raw: string): bigint | null {
  const s = raw.trim();
  if (!s) return null;
  if (!/^\d*\.?\d*$/.test(s)) return null;
  const [whole, frac = ""] = s.split(".");
  const frac6 = (frac + "000000").slice(0, 6);
  const w = BigInt(whole || "0");
  const f = BigInt(frac6 || "0");
  const amount = w * BigInt(1_000_000) + f;
  return amount > BigInt(0) ? amount : null;
}

function fiatMinorFromTrade(usdtHuman: number, rate: number): bigint {
  const fiat = usdtHuman * rate;
  return BigInt(Math.max(0, Math.round(fiat * 100)));
}

export function TradeBox() {
  const t = useTranslations("Home");
  const { currency, usdtInFiat, loading, resolvedMidQuote, compareBankVsRroyalAt } =
    useCurrency();
  const { activeLock, clearLock } = useTradeIntent();
  const { openConnectModal } = useConnectModal();
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { switchChainAsync } = useSwitchChain();
  const {
    writeContractAsync,
    isPending: isWritePending,
    error: writeError,
    reset: resetWrite,
  } = useWriteContract();

  const [side, setSide] = useState<Side>("buy");
  const [usdtAmount, setUsdtAmount] = useState("");
  const [buyerAddress, setBuyerAddress] = useState("");
  const [pricingMode, setPricingMode] = useState<PricingMode>("linked");
  const [customRate, setCustomRate] = useState("");
  const [txHash, setTxHash] = useState<`0x${string}` | undefined>();
  const [lastOrderId, setLastOrderId] = useState<string | null>(null);
  const [lastExpiresAt, setLastExpiresAt] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);
  const [lifecycleSession, setLifecycleSession] = useState<TradeLifecycleSession | null>(
    null
  );
  const lifecycleCapturedRef = useRef(false);

  const { data: receipt, isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({
      hash: txHash,
      chainId: sepolia.id,
    });

  const configured = isSepoliaContractsConfigured();
  const escrowAddr = sepoliaContracts.escrow as `0x${string}`;
  const onSepolia = chainId === sepolia.id;

  const pair = `${currency}/USDT`;

  const usdtMicro = useMemo(() => parseUsdtToMicroUnits(usdtAmount), [usdtAmount]);
  const usdtHuman = useMemo(() => {
    if (usdtMicro == null) return null;
    return Number(usdtMicro) / 1e6;
  }, [usdtMicro]);

  const buyerOk =
    isAddress(buyerAddress) &&
    address &&
    buyerAddress.trim().toLowerCase() !== address.toLowerCase();

  const fiatEnum = currency === "GEL" ? 1 : 0;
  const pricingModeEnum = pricingMode === "fixed" ? 1 : 0;
  const linkedRate = resolvedMidQuote?.rroyalMidRatePerUsd ?? usdtInFiat;
  const lockActive =
    activeLock != null &&
    activeLock.currency === currency &&
    Math.floor(Date.now() / 1000) < activeLock.expiresAt;
  const activeRate =
    pricingMode === "fixed"
      ? Number(customRate)
      : lockActive
        ? activeLock.lockedRate
        : linkedRate;
  const fiatMinor =
    usdtHuman != null && activeRate != null && Number.isFinite(activeRate)
      ? fiatMinorFromTrade(usdtHuman, activeRate)
      : null;
  const rateSnapshotE6 =
    activeRate != null && Number.isFinite(activeRate) && activeRate > 0
      ? BigInt(Math.round(activeRate * 1_000_000))
      : null;
  const comparison =
    pricingMode === "linked" && usdtHuman != null && usdtHuman > 0
      ? compareBankVsRroyalAt(usdtHuman)
      : null;
  const savingsTotal =
    comparison != null && comparison.savingsAbsolute > 0 ? comparison.savingsAbsolute : null;

  useEffect(() => {
    setLastOrderId(null);
    setLastExpiresAt(null);
    setTxHash(undefined);
    setLifecycleSession(null);
    lifecycleCapturedRef.current = false;
  }, [usdtAmount, buyerAddress, pricingMode, customRate, side]);

  useEffect(() => {
    if (!isConfirmed || !txHash || !lastOrderId || lifecycleCapturedRef.current) return;
    const rq = resolvedMidQuote;
    const uh = usdtHuman ?? 0;
    const mid = rq?.rroyalMidRatePerUsd ?? linkedRate ?? 0;
    const started = createInitiatedSession({
      corridorId: rq?.corridorId ?? "GENERIC",
      fiatCurrency: currency,
      fixedMidRatePerUsd: mid,
      amountUsdtHuman: uh,
    });
    const session = applyOnChainTradeCreated(started, txHash);
    setLifecycleSession(session);
    lifecycleCapturedRef.current = true;
  }, [
    isConfirmed,
    txHash,
    lastOrderId,
    resolvedMidQuote,
    currency,
    usdtHuman,
    linkedRate,
  ]);

  useEffect(() => {
    if (!isConfirmed || !receipt) return;
    const logs = parseEventLogs({
      abi: rroyalEscrowAbi,
      logs: receipt.logs.filter(
        (l) => l.address.toLowerCase() === escrowAddr.toLowerCase()
      ),
      eventName: "TradeCreated",
    });
    const first = logs[0];
    const id = first?.args?.orderId;
    const expiresAt = first?.args?.expiresAt;
    if (typeof id === "bigint") setLastOrderId(id.toString());
    if (typeof expiresAt === "bigint") setLastExpiresAt(Number(expiresAt));
  }, [escrowAddr, isConfirmed, receipt]);

  const handleCopyBuyer = useCallback(() => {
    if (!address) return;
    void navigator.clipboard.writeText(address);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  }, [address]);

  const handleSellSubmit = useCallback(async () => {
    if (
      !configured ||
      !onSepolia ||
      usdtMicro == null ||
      !buyerOk ||
      fiatMinor == null ||
      rateSnapshotE6 == null
    ) return;
    resetWrite();
    const hash = await writeContractAsync({
      address: escrowAddr,
      abi: rroyalEscrowAbi,
      functionName: "createTrade",
      args: [
        buyerAddress.trim() as `0x${string}`,
        usdtMicro,
        fiatMinor,
        fiatEnum,
        pricingModeEnum,
        rateSnapshotE6,
      ],
      chainId: sepolia.id,
    });
    setTxHash(hash);
  }, [
    buyerAddress,
    buyerOk,
    configured,
    escrowAddr,
    fiatEnum,
    fiatMinor,
    onSepolia,
    pricingModeEnum,
    rateSnapshotE6,
    usdtMicro,
    resetWrite,
    writeContractAsync,
  ]);

  const sellBlockingReason = useMemo(() => {
    if (!configured) return "contracts" as const;
    if (loading || linkedRate == null) return "rates" as const;
    if (pricingMode === "fixed" && (!customRate.trim() || !(Number(customRate) > 0))) return "fixedRate" as const;
    if (usdtMicro == null) return "amount" as const;
    if (!buyerAddress.trim()) return "buyerEmpty" as const;
    if (!isAddress(buyerAddress.trim())) return "buyerInvalid" as const;
    if (address && buyerAddress.trim().toLowerCase() === address.toLowerCase()) return "buyerSelf" as const;
    if (fiatMinor == null) return "fiat" as const;
    return null;
  }, [address, buyerAddress, configured, customRate, fiatMinor, linkedRate, loading, pricingMode, usdtMicro]);

  const lockRemaining = useMemo(() => {
    if (!lastExpiresAt) return null;
    const now = Math.floor(Date.now() / 1000);
    return Math.max(0, lastExpiresAt - now);
  }, [lastExpiresAt]);
  const orderLockRemaining = useMemo(() => {
    if (!activeLock) return null;
    const now = Math.floor(Date.now() / 1000);
    return Math.max(0, activeLock.expiresAt - now);
  }, [activeLock]);

  useEffect(() => {
    if (activeLock && orderLockRemaining === 0) clearLock();
  }, [activeLock, clearLock, orderLockRemaining]);

  const sellButtonDisabled =
    !isConnected ||
    !onSepolia ||
    isWritePending ||
    isConfirming ||
    sellBlockingReason !== null;

  const sellButtonLabel = (() => {
    if (isWritePending) return t("tradePendingWallet");
    if (isConfirming) return t("tradeConfirming");
    return t("tradeCta");
  })();

  const openConnect = () => openConnectModal?.();

  return (
    <section
      className="cosmic-glass-panel rounded-2xl p-6 sm:p-8"
      aria-labelledby="trade-box-heading"
    >
      <div className="flex flex-col gap-1 border-b border-white/[0.06] pb-4">
        <h2
          id="trade-box-heading"
          className="text-lg font-semibold tracking-[0.08em] text-zinc-50"
        >
          {t("tradeBoxTitle")}
        </h2>
        <p className="text-sm tracking-wide text-zinc-500">
          {t("tradeBoxSubtitle", { pair })}
        </p>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-1 rounded-xl border border-white/[0.08] bg-black/30 p-1">
        <button
          type="button"
          onClick={() => setSide("buy")}
          className={`rounded-lg py-2.5 text-sm font-medium tracking-wide transition ${
            side === "buy"
              ? "border border-emerald-500/30 bg-emerald-500/15 text-emerald-50 shadow-[0_0_20px_rgba(34,211,238,0.12)]"
              : "text-zinc-500 hover:text-zinc-300"
          }`}
        >
          {t("tradeBuy")}
        </button>
        <button
          type="button"
          onClick={() => setSide("sell")}
          className={`rounded-lg py-2.5 text-sm font-medium tracking-wide transition ${
            side === "sell"
              ? "border border-emerald-500/30 bg-emerald-500/15 text-emerald-50 shadow-[0_0_20px_rgba(34,211,238,0.12)]"
              : "text-zinc-500 hover:text-zinc-300"
          }`}
        >
          {t("tradeSell")}
        </button>
      </div>

      <div className="mt-6 space-y-4">
        {lockActive && orderLockRemaining != null ? (
          <div className="rounded-xl border border-emerald-400/30 bg-emerald-500/10 px-3 py-2.5">
            <p className="text-xs tracking-wide text-emerald-100">
              {t("tradeOrderLockId", { id: activeLock.tradeId })}
            </p>
            <p className="mt-1 text-[11px] tracking-wide text-emerald-200/90">
              {t("tradeOrderLockCountdown", { minutes: Math.ceil(orderLockRemaining / 60) })}
            </p>
          </div>
        ) : null}
        <div>
          <label
            htmlFor="trade-usdt"
            className="block text-xs font-medium uppercase tracking-[0.16em] text-zinc-500"
          >
            {t("tradeAmountUsdt")}
          </label>
          <input
            id="trade-usdt"
            type="text"
            inputMode="decimal"
            autoComplete="off"
            placeholder="0.00"
            value={usdtAmount}
            onChange={(e) => setUsdtAmount(e.target.value)}
            className="mt-1.5 w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2.5 font-mono text-sm tracking-wide text-zinc-100 tabular-nums placeholder:text-zinc-600 focus:border-emerald-500/40 focus:outline-none focus:ring-1 focus:ring-emerald-500/30"
          />
        </div>

        {side === "sell" ? (
          <div>
            <label
              htmlFor="trade-buyer"
              className="block text-xs font-medium uppercase tracking-[0.16em] text-zinc-500"
            >
              {t("tradeBuyerAddress")}
            </label>
            <input
              id="trade-buyer"
              type="text"
              inputMode="text"
              autoComplete="off"
              spellCheck={false}
              placeholder={t("tradeBuyerPlaceholder")}
              value={buyerAddress}
              onChange={(e) => setBuyerAddress(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2.5 font-mono text-sm tracking-wide text-zinc-100 placeholder:text-zinc-600 focus:border-emerald-500/40 focus:outline-none focus:ring-1 focus:ring-emerald-500/30"
            />
            <p className="mt-1.5 text-[11px] leading-relaxed tracking-wide text-zinc-600">
              {t("tradeFiatLegNote")}
            </p>
          </div>
        ) : null}

        {side === "sell" ? (
          <div className="rounded-xl border border-white/[0.08] bg-black/25 p-3">
            <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-zinc-500">
              {t("tradePricingMode")}
            </p>
            <div className="mt-2 grid grid-cols-2 gap-1 rounded-lg border border-white/[0.08] bg-black/30 p-1">
              <button
                type="button"
                onClick={() => setPricingMode("linked")}
                className={`rounded-md px-2 py-2 text-xs tracking-wide ${pricingMode === "linked" ? "bg-emerald-500/20 text-emerald-100" : "text-zinc-400"}`}
              >
                {t("tradePricingLinked")}
              </button>
              <button
                type="button"
                onClick={() => setPricingMode("fixed")}
                className={`rounded-md px-2 py-2 text-xs tracking-wide ${pricingMode === "fixed" ? "bg-emerald-500/20 text-emerald-100" : "text-zinc-400"}`}
              >
                {t("tradePricingFixed")}
              </button>
            </div>
            {pricingMode === "fixed" ? (
              <div className="mt-2">
                <label htmlFor="custom-rate" className="text-[11px] tracking-wide text-zinc-500">
                  {t("tradeCustomRate", { fiat: currency })}
                </label>
                <input
                  id="custom-rate"
                  type="text"
                  inputMode="decimal"
                  value={customRate}
                  onChange={(e) => setCustomRate(e.target.value)}
                  placeholder="0.0000"
                  className="mt-1 w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 font-mono text-xs text-zinc-100"
                />
              </div>
            ) : null}
            {pricingMode === "linked" && resolvedMidQuote ? (
              <div className="mt-2 rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-2">
                <p className="text-[11px] tracking-wide text-emerald-100">
                  {t("tradeMidpointHint", {
                    buy: resolvedMidQuote.bankBuyRatePerUsd.toFixed(4),
                    sell: resolvedMidQuote.bankSellRatePerUsd.toFixed(4),
                    mid: resolvedMidQuote.rroyalMidRatePerUsd.toFixed(4),
                    fiat: currency,
                  })}
                </p>
                {savingsTotal != null ? (
                  <p className="mt-1 text-[11px] tracking-wide text-emerald-200">
                    {t("tradeSavingsHint", {
                      amount: savingsTotal.toFixed(2),
                      fiat: currency,
                    })}
                  </p>
                ) : null}
              </div>
            ) : null}
            {pricingMode === "linked" && resolvedMidQuote?.narrowSpread ? (
              <p className="mt-2 rounded-lg border border-amber-400/30 bg-amber-500/10 px-2.5 py-2 text-[11px] tracking-wide text-amber-100">
                {t("tradeSpreadRisk")}
              </p>
            ) : null}
          </div>
        ) : null}

        <div className="rounded-xl border border-dashed border-white/[0.08] bg-white/[0.02] px-3 py-2.5">
          <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-zinc-600">
            {t("tradeYouSee")}
          </p>
          <p className="mt-1 text-sm tracking-wide text-zinc-400">
            {side === "buy" ? t("tradeBuyExplain") : t("tradeSellExplain")}
          </p>
          <p className="mt-2 font-mono text-xs tracking-wide text-emerald-200/80">
            {loading
              ? t("ratesStale")
              : linkedRate != null
                ? t("tradeReference", {
                    side: side === "buy" ? t("tradeBuy") : t("tradeSell"),
                    fiat: currency,
                    rate: (activeRate ?? 0).toLocaleString(undefined, {
                      maximumFractionDigits: getRateFractionDigits(currency, activeRate ?? 0),
                    }),
                  })
                : "—"}
          </p>
          <RateTrustBadge />
        </div>

        {side === "sell" ? (
          <>
            {!isConnected ? (
              <button
                type="button"
                onClick={() => openConnect()}
                className="w-full rounded-xl border border-emerald-400/40 bg-emerald-500/20 py-3 text-sm font-medium tracking-[0.1em] text-emerald-50 transition hover:bg-emerald-500/25"
              >
                {t("tradeConnectWallet")}
              </button>
            ) : !onSepolia ? (
              <button
                type="button"
                onClick={() => void switchChainAsync?.({ chainId: sepolia.id })}
                className="w-full rounded-xl border border-amber-400/40 bg-amber-500/15 py-3 text-sm font-medium tracking-[0.1em] text-amber-100 transition hover:bg-amber-500/20"
              >
                {t("tradeSwitchNetwork")}
              </button>
            ) : !configured ? (
              <p className="rounded-xl border border-white/10 bg-black/30 px-3 py-3 text-center text-xs tracking-wide text-zinc-500">
                {t("tradeContractsMissing")}
              </p>
            ) : (
              <button
                type="button"
                disabled={sellButtonDisabled}
                onClick={() => void handleSellSubmit()}
                title={
                  sellBlockingReason === "amount"
                    ? t("tradeInvalidAmount")
                    : sellBlockingReason === "fixedRate"
                      ? t("tradeInvalidAmount")
                    : sellBlockingReason === "buyerEmpty" || sellBlockingReason === "buyerInvalid"
                      ? t("tradeInvalidBuyer")
                      : sellBlockingReason === "buyerSelf"
                        ? t("tradeInvalidBuyer")
                        : sellBlockingReason === "rates"
                          ? t("ratesStale")
                          : undefined
                }
                className="w-full rounded-xl border border-emerald-400/50 bg-emerald-500/20 py-3 text-sm font-medium tracking-[0.1em] text-emerald-50 shadow-[0_0_24px_rgba(34,211,238,0.12)] transition hover:bg-emerald-500/25 disabled:cursor-not-allowed disabled:border-white/10 disabled:bg-zinc-800 disabled:text-zinc-500 disabled:shadow-none"
              >
                {sellButtonLabel}
              </button>
            )}

            {writeError ? (
              <p className="text-center text-xs tracking-wide text-rose-300/90">
                {t("tradeTxError")}: {writeError.message.split("\n")[0]}
              </p>
            ) : null}

            {lastOrderId && txHash ? (
              <div className="rounded-xl border border-emerald-500/25 bg-emerald-500/10 px-3 py-3 text-sm tracking-wide text-emerald-100/95">
                <p>{t("tradeSuccessOrder", { orderId: lastOrderId })}</p>
                {lifecycleSession ? (
                  <div className="mt-3 rounded-lg border border-white/10 bg-black/25 px-2.5 py-2 text-left">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-zinc-400">
                      {t("tradeLifecycleTitle")}
                    </p>
                    <ol className="mt-2 space-y-1.5 text-[11px] tracking-wide text-emerald-100/95">
                      {ESCROW_WORKFLOW_ORDER.map((step) => {
                        const idx = ESCROW_WORKFLOW_ORDER.indexOf(step);
                        const cur = ESCROW_WORKFLOW_ORDER.indexOf(
                          lifecycleSession.step as EscrowWorkflowState
                        );
                        const done = cur >= 0 && idx <= cur;
                        const label = (() => {
                          switch (step) {
                            case "initiated":
                              return t("tradeWorkflowInitiated");
                            case "price_locked":
                              return t("tradeWorkflowPriceLocked");
                            case "usdt_escrowed":
                              return t("tradeWorkflowUsdtEscrowed", {
                                ref: lifecycleSession.escrowRef ?? txHash,
                              });
                            case "fiat_confirmed":
                              return t("tradeWorkflowFiatConfirmed");
                            case "released":
                              return t("tradeWorkflowReleased");
                            default:
                              return step;
                          }
                        })();
                        return (
                          <li
                            key={step}
                            className={done ? "text-emerald-100/95" : "text-zinc-600"}
                          >
                            <span className="mr-1.5 font-mono text-[10px]">{done ? "✓" : "○"}</span>
                            {label}
                          </li>
                        );
                      })}
                    </ol>
                  </div>
                ) : null}
                {lockRemaining != null ? (
                  <p className="mt-1 text-xs text-emerald-200/90">
                    {t("tradePriceLock", { minutes: Math.ceil(lockRemaining / 60) })}
                  </p>
                ) : null}
                <a
                  href={`https://sepolia.etherscan.io/tx/${txHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 inline-block text-xs font-medium text-emerald-200 underline decoration-cyan-500/40 underline-offset-2"
                >
                  {t("tradeExplorer")}
                </a>
              </div>
            ) : null}
          </>
        ) : (
          <button
            type="button"
            onClick={() => (isConnected ? handleCopyBuyer() : openConnect?.())}
            className="w-full rounded-xl border border-white/15 bg-white/[0.08] py-3 text-sm font-medium tracking-[0.1em] text-zinc-100 transition hover:bg-white/[0.1]"
          >
            {isConnected ? (copied ? t("tradeBuyCopied") : t("tradeBuyCopy")) : t("tradeBuyConnect")}
          </button>
        )}

        <p className="text-center text-[11px] leading-relaxed tracking-wide text-zinc-600">
          {side === "sell" ? t("tradeDisclaimerSell") : t("tradeDisclaimerBuy")}
        </p>
      </div>
    </section>
  );
}
