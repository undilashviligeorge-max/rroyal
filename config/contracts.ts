/**
 * Sepolia contract addresses from NEXT_PUBLIC_* env (see `.env` / Vercel).
 * Used by the marketing UI today; future on-chain actions should import from here.
 */
export const sepoliaContracts = {
  escrow: (process.env.NEXT_PUBLIC_ESCROW_ADDRESS ?? "").trim(),
  mockUsdt: (process.env.NEXT_PUBLIC_MOCK_USDT_ADDRESS ?? "").trim(),
} as const;

function isLikelyEthAddress(a: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(a);
}

export function isSepoliaContractsConfigured(): boolean {
  return (
    isLikelyEthAddress(sepoliaContracts.escrow) &&
    isLikelyEthAddress(sepoliaContracts.mockUsdt)
  );
}
