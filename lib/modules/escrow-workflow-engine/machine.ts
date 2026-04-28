import type { EscrowWorkflowState } from "./states";

/** Allowed forward transitions (strict state machine). */
const ALLOWED: Record<EscrowWorkflowState, EscrowWorkflowState[]> = {
  initiated: ["price_locked"],
  price_locked: ["usdt_escrowed"],
  usdt_escrowed: ["fiat_confirmed"],
  fiat_confirmed: ["released"],
  released: [],
};

export function canTransitionEscrow(from: EscrowWorkflowState, to: EscrowWorkflowState): boolean {
  return ALLOWED[from]?.includes(to) ?? false;
}

export function assertTransition(from: EscrowWorkflowState, to: EscrowWorkflowState): void {
  if (!canTransitionEscrow(from, to)) {
    throw new Error(`Invalid escrow transition: ${from} → ${to}`);
  }
}
