/** Minimal ABI for seller `createTrade` + receipt parsing. Matches `contracts/RroyalP2PEscrow.sol`. */
export const rroyalEscrowAbi = [
  {
    type: "function",
    name: "createTrade",
    stateMutability: "nonpayable",
    inputs: [
      { name: "buyer", type: "address" },
      { name: "usdtAmount", type: "uint256" },
      { name: "fiatAmount", type: "uint256" },
      { name: "fiatCurrency", type: "uint8" },
    ],
    outputs: [{ name: "orderId", type: "uint256" }],
  },
  {
    type: "event",
    name: "TradeCreated",
    inputs: [
      { name: "orderId", type: "uint256", indexed: true },
      { name: "seller", type: "address", indexed: true },
      { name: "buyer", type: "address", indexed: true },
      { name: "usdtAmount", type: "uint256", indexed: false },
      { name: "fiatAmount", type: "uint256", indexed: false },
      { name: "fiatCurrency", type: "uint8", indexed: false },
    ],
  },
] as const;
