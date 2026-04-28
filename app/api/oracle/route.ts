import { NextResponse } from "next/server";

import { getOracleSnapshot } from "@/lib/engine/oracle";

export const revalidate = 300;

export async function GET() {
  try {
    const snapshot = await getOracleSnapshot();
    return NextResponse.json(snapshot);
  } catch {
    return NextResponse.json({ error: "oracle_unavailable" }, { status: 502 });
  }
}
