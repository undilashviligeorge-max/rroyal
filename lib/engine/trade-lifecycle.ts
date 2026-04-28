/**
 * Trade session helpers — aligned with Escrow Workflow Engine states.
 */

import { assertTransition, type EscrowWorkflowState } from "@/lib/modules/escrow-workflow-engine";

export type TradeLifecycleStep = EscrowWorkflowState;

export type TradeLifecycleSession = {
  id: string;
  corridorId: string;
  fiatCurrency: string;
  fixedMidRatePerUsd: number;
  amountUsdtHuman: number;
  step: EscrowWorkflowState;
  escrowRef: string | null;
  fiatVerificationRef: string | null;
  createdAt: number;
};

function randomRef(prefix: string): string {
  const n = Math.floor(Math.random() * 1e9).toString(36).toUpperCase();
  return `${prefix}-${n}`;
}

export function createInitiatedSession(input: {
  corridorId: string;
  fiatCurrency: string;
  fixedMidRatePerUsd: number;
  amountUsdtHuman: number;
}): TradeLifecycleSession {
  return {
    id: randomRef("TLS"),
    corridorId: input.corridorId,
    fiatCurrency: input.fiatCurrency,
    fixedMidRatePerUsd: input.fixedMidRatePerUsd,
    amountUsdtHuman: input.amountUsdtHuman,
    step: "initiated",
    escrowRef: null,
    fiatVerificationRef: null,
    createdAt: Date.now(),
  };
}

/** Legacy alias */
export const createPricedSession = createInitiatedSession;

export function advanceToPriceLocked(session: TradeLifecycleSession): TradeLifecycleSession {
  assertTransition(session.step, "price_locked");
  return { ...session, step: "price_locked" };
}

export function advanceToUsdtEscrowed(
  session: TradeLifecycleSession,
  chainTxHash?: string
): TradeLifecycleSession {
  assertTransition(session.step, "usdt_escrowed");
  return {
    ...session,
    step: "usdt_escrowed",
    escrowRef: chainTxHash ?? randomRef("ESC"),
  };
}

/**
 * When on-chain `createTrade` confirms: **price_locked** (rate snapshot on-chain) then
 * **usdt_escrowed** anchor (demo — production splits `lockUSDT` vs indexer).
 */
export function applyOnChainTradeCreated(
  session: TradeLifecycleSession,
  chainTxHash?: string
): TradeLifecycleSession {
  let s = session;
  if (s.step === "initiated") {
    s = advanceToPriceLocked(s);
  }
  if (s.step === "price_locked") {
    s = advanceToUsdtEscrowed(s, chainTxHash);
  }
  return s;
}

export function advanceToFiatConfirmed(
  session: TradeLifecycleSession,
  bankReference?: string
): TradeLifecycleSession {
  assertTransition(session.step, "fiat_confirmed");
  return {
    ...session,
    step: "fiat_confirmed",
    fiatVerificationRef: bankReference ?? randomRef("FIAT"),
  };
}

export function advanceToReleased(session: TradeLifecycleSession): TradeLifecycleSession {
  assertTransition(session.step, "released");
  return { ...session, step: "released" };
}

/** @deprecated use advanceToUsdtEscrowed */
export function attachMockEscrow(session: TradeLifecycleSession, chainTxHash?: string): TradeLifecycleSession {
  if (session.step === "initiated") {
    return advanceToUsdtEscrowed(advanceToPriceLocked(session), chainTxHash);
  }
  if (session.step === "price_locked") {
    return advanceToUsdtEscrowed(session, chainTxHash);
  }
  return advanceToUsdtEscrowed(session, chainTxHash);
}

/** @deprecated use advanceToFiatConfirmed */
export function attachFiatVerification(
  session: TradeLifecycleSession,
  bankReference?: string
): TradeLifecycleSession {
  return advanceToFiatConfirmed(session, bankReference);
}

/** @deprecated use advanceToReleased */
export function completeLifecycle(session: TradeLifecycleSession): TradeLifecycleSession {
  let s = session;
  if (s.step === "usdt_escrowed") {
    s = advanceToFiatConfirmed(s);
  }
  if (s.step === "fiat_confirmed") {
    s = advanceToReleased(s);
  }
  return s;
}
