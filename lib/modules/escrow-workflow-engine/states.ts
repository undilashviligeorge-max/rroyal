/**
 * Escrow Workflow Engine — canonical on-chain / ops lifecycle for a trade.
 * Maps cleanly to contract phases (Pending → Locked → …) when wired to production.
 */
export type EscrowWorkflowState =
  | "initiated"
  | "price_locked"
  | "usdt_escrowed"
  | "fiat_confirmed"
  | "released";

export const ESCROW_WORKFLOW_ORDER: EscrowWorkflowState[] = [
  "initiated",
  "price_locked",
  "usdt_escrowed",
  "fiat_confirmed",
  "released",
];
