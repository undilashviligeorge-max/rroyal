/**
 * Global Liquidity Engine — USD-anchored FX feed.
 * Primary path: ExchangeRate-API v6 when `EXCHANGERATE_API_KEY` is set; otherwise OpenExchangeRates, then open.er-api.com.
 */
export { getGlobalRates, type GlobalRatesPayload } from "@/lib/global-rates";
