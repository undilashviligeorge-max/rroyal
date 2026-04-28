"use client";

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";

const LOCK_WINDOW_SECONDS = 15 * 60;

export type LockedIntent = {
  tradeId: string;
  amountUsdt: number;
  lockedRate: number;
  currency: string;
  expiresAt: number;
};

type TradeIntentContextValue = {
  lockFromOrderBook: (input: { amountUsdt: number; lockedRate: number; currency: string }) => LockedIntent;
  activeLock: LockedIntent | null;
  clearLock: () => void;
};

const TradeIntentContext = createContext<TradeIntentContextValue | null>(null);

function newTradeId(): string {
  const rand = Math.floor(Math.random() * 1_000_000).toString().padStart(6, "0");
  return `RB-${Date.now().toString().slice(-6)}-${rand}`;
}

export function TradeIntentProvider({ children }: { children: ReactNode }) {
  const [activeLock, setActiveLock] = useState<LockedIntent | null>(null);

  const lockFromOrderBook = useCallback(
    (input: { amountUsdt: number; lockedRate: number; currency: string }) => {
      const next: LockedIntent = {
        tradeId: newTradeId(),
        amountUsdt: input.amountUsdt,
        lockedRate: input.lockedRate,
        currency: input.currency,
        expiresAt: Math.floor(Date.now() / 1000) + LOCK_WINDOW_SECONDS,
      };
      setActiveLock(next);
      return next;
    },
    []
  );

  const clearLock = useCallback(() => setActiveLock(null), []);

  const value = useMemo(
    () => ({
      lockFromOrderBook,
      activeLock,
      clearLock,
    }),
    [activeLock, clearLock, lockFromOrderBook]
  );

  return <TradeIntentContext.Provider value={value}>{children}</TradeIntentContext.Provider>;
}

export function useTradeIntent() {
  const ctx = useContext(TradeIntentContext);
  if (!ctx) throw new Error("useTradeIntent must be used within TradeIntentProvider");
  return ctx;
}
