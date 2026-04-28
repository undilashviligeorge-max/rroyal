import { NextRequest, NextResponse } from "next/server";

import { computeMidPointFromOfficial } from "@/lib/engine/bank-spread";
import { getGlobalRates } from "@/lib/global-rates";

export const revalidate = 300;

type BankSpreadPayload = {
  currency: string;
  officialRate: number;
  buyRate: number;
  sellRate: number;
  midRate: number;
  spread: number;
  narrow: boolean;
  source: string;
  updated: number;
};

export async function GET(req: NextRequest) {
  try {
    const c = req.nextUrl.searchParams.get("currency")?.trim().toUpperCase() || "USD";
    const data = await getGlobalRates();
    let officialRate = data.rates[c];
    if ((typeof officialRate !== "number" || !Number.isFinite(officialRate)) && c === "ZWG") {
      officialRate = data.rates.ZWL;
    }
    if ((typeof officialRate !== "number" || !Number.isFinite(officialRate)) && c === "ZWL") {
      officialRate = data.rates.ZWG;
    }
    if (typeof officialRate !== "number" || !Number.isFinite(officialRate)) {
      return NextResponse.json({ error: "unsupported currency" }, { status: 400 });
    }

    const mp = computeMidPointFromOfficial(officialRate);

    const payload: BankSpreadPayload = {
      currency: c,
      officialRate: mp.officialRatePerUsd,
      buyRate: mp.bankBuyRatePerUsd,
      sellRate: mp.bankSellRatePerUsd,
      midRate: mp.rroyalMidRatePerUsd,
      spread: mp.spreadWidth,
      narrow: mp.narrowSpread,
      source: "bank-spread-simulated",
      updated: data.updated,
    };
    return NextResponse.json(payload);
  } catch {
    return NextResponse.json({ error: "unavailable" }, { status: 502 });
  }
}
