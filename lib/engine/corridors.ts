import type { CorridorDefinition } from "./types";

/**
 * Active trading corridors — product-facing routing + SLA metrics.
 * Rates are resolved server-side against USD anchor (USDT proxy).
 */
export const ACTIVE_CORRIDORS: CorridorDefinition[] = [
  {
    id: "GE-GEL",
    originCountry: "GE",
    destinationCountry: "GE",
    fiatCurrency: "GEL",
    settlementMinutesTypical: 8,
  },
  {
    id: "GE-US",
    originCountry: "GE",
    destinationCountry: "US",
    fiatCurrency: "USD",
    settlementMinutesTypical: 12,
  },
  /** ZW/ZWG corridor stays off public oracle/UI — wire via internal ops/API only when needed. */
];

export function corridorForCurrency(code: string): CorridorDefinition | undefined {
  const u = code.trim().toUpperCase();
  return ACTIVE_CORRIDORS.find((c) => c.fiatCurrency === u);
}
