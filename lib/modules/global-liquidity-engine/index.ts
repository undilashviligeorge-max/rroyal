/**
 * @module Global Liquidity Engine
 * Exchange-rate feed → market-maker mid between bank buy/sell → oracle corridors.
 */
export { getGlobalRates, type GlobalRatesPayload } from "./feed";
export { quoteLiquidityLeg, type RroyalLiquidityLeg } from "./market-maker";
export { buildOracleSnapshot, getOracleSnapshot } from "./build-oracle";
