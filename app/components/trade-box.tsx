"use client";

import { useConnectModal } from "@rainbow-me/rainbowkit";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useMemo, useState } from "react";
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

import { RateTrustBadge } from "./rate-trust-badge";
import { getRateFractionDigits, useCurrency } from "../contexts/price-provider";

type Side = "buy" | "sell";

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
  const { currency, usdtInFiat, loading } = useCurrency();
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
  const [txHash, setTxHash] = useState<`0x${string}` | undefined>();
  const [lastOrderId, setLastOrderId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

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
  const fiatMinor =
    usdtHuman != null && usdtInFiat != null ? fiatMinorFromTrade(usdtHuman, usdtInFiat) : null;

  useEffect(() => {
    setLastOrderId(null);
    setTxHash(undefined);
  }, [usdtAmount, buyerAddress, side]);

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
    if (typeof id === "bigint") setLastOrderId(id.toString());
  }, [escrowAddr, isConfirmed, receipt]);

  const handleCopyBuyer = useCallback(() => {
    if (!address) return;
    void navigator.clipboard.writeText(address);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  }, [address]);

  const handleSellSubmit = useCallback(async () => {
    if (!configured || !onSepolia || usdtMicro == null || !buyerOk || fiatMinor == null) return;
    resetWrite();
    const hash = await writeContractAsync({
      address: escrowAddr,
      abi: rroyalEscrowAbi,
      functionName: "createTrade",
      args: [buyerAddress.trim() as `0x${string}`, usdtMicro, fiatMinor, fiatEnum],
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
    usdtMicro,
    resetWrite,
    writeContractAsync,
  ]);

  const sellBlockingReason = useMemo(() => {
    if (!configured) return "contracts" as const;
    if (loading || usdtInFiat == null) return "rates" as const;
    if (usdtMicro == null) return "amount" as const;
    if (!buyerAddress.trim()) return "buyerEmpty" as const;
    if (!isAddress(buyerAddress.trim())) return "buyerInvalid" as const;
    if (address && buyerAddress.trim().toLowerCase() === address.toLowerCase()) return "buyerSelf" as const;
    if (fiatMinor == null) return "fiat" as const;
    return null;
  }, [address, buyerAddress, configured, fiatMinor, loading, usdtInFiat, usdtMicro]);

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
              ? "border border-cyan-500/30 bg-cyan-500/15 text-cyan-50 shadow-[0_0_20px_rgba(34,211,238,0.12)]"
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
              ? "border border-cyan-500/30 bg-cyan-500/15 text-cyan-50 shadow-[0_0_20px_rgba(34,211,238,0.12)]"
              : "text-zinc-500 hover:text-zinc-300"
          }`}
        >
          {t("tradeSell")}
        </button>
      </div>

      <div className="mt-6 space-y-4">
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
            className="mt-1.5 w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2.5 font-mono text-sm tracking-wide text-zinc-100 tabular-nums placeholder:text-zinc-600 focus:border-cyan-500/40 focus:outline-none focus:ring-1 focus:ring-cyan-500/30"
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
              className="mt-1.5 w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2.5 font-mono text-sm tracking-wide text-zinc-100 placeholder:text-zinc-600 focus:border-cyan-500/40 focus:outline-none focus:ring-1 focus:ring-cyan-500/30"
            />
            <p className="mt-1.5 text-[11px] leading-relaxed tracking-wide text-zinc-600">
              {t("tradeFiatLegNote")}
            </p>
          </div>
        ) : null}

        <div className="rounded-xl border border-dashed border-white/[0.08] bg-white/[0.02] px-3 py-2.5">
          <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-zinc-600">
            {t("tradeYouSee")}
          </p>
          <p className="mt-1 text-sm tracking-wide text-zinc-400">
            {side === "buy" ? t("tradeBuyExplain") : t("tradeSellExplain")}
          </p>
          <p className="mt-2 font-mono text-xs tracking-wide text-cyan-200/80">
            {loading
              ? t("ratesStale")
              : usdtInFiat != null
                ? t("tradeReference", {
                    side: side === "buy" ? t("tradeBuy") : t("tradeSell"),
                    fiat: currency,
                    rate: usdtInFiat.toLocaleString(undefined, {
                      maximumFractionDigits: getRateFractionDigits(currency, usdtInFiat),
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
                className="w-full rounded-xl border border-cyan-400/40 bg-cyan-500/20 py-3 text-sm font-medium tracking-[0.1em] text-cyan-50 transition hover:bg-cyan-500/25"
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
                    : sellBlockingReason === "buyerEmpty" || sellBlockingReason === "buyerInvalid"
                      ? t("tradeInvalidBuyer")
                      : sellBlockingReason === "buyerSelf"
                        ? t("tradeInvalidBuyer")
                        : sellBlockingReason === "rates"
                          ? t("ratesStale")
                          : undefined
                }
                className="w-full rounded-xl border border-cyan-400/50 bg-cyan-500/20 py-3 text-sm font-medium tracking-[0.1em] text-cyan-50 shadow-[0_0_24px_rgba(34,211,238,0.12)] transition hover:bg-cyan-500/25 disabled:cursor-not-allowed disabled:border-white/10 disabled:bg-zinc-800 disabled:text-zinc-500 disabled:shadow-none"
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
                <a
                  href={`https://sepolia.etherscan.io/tx/${txHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 inline-block text-xs font-medium text-cyan-200 underline decoration-cyan-500/40 underline-offset-2"
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
