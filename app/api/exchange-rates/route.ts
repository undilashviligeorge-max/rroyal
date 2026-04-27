import { NextResponse } from "next/server";
import { getGlobalRates } from "@/lib/global-rates";

export const revalidate = 3600;

export async function GET() {
  try {
    const data = await getGlobalRates();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json(
      { base: "USD", rates: {}, updated: 0, source: "none", coverage: 0, error: true },
      { status: 502 }
    );
  }
}
