"use client";

import { useEffect, useMemo, useState } from "react";

import { useCurrency } from "../contexts/price-provider";

const STALE_AFTER_SECONDS = 60 * 60 * 24;

function sourceLabel(source: string): string {
  if (source === "exchangerate-api") return "Official Bank Rate";
  if (source === "openexchangerates") return "Reference Bank Feed";
  if (source === "open.er-api") return "Reference Market Feed";
  return "Rate Feed";
}

function formatUpdatedAgo(updatedAt: number | null, nowMs: number): string {
  if (!updatedAt) return "Updated unknown";
  const deltaSec = Math.max(0, Math.floor(nowMs / 1000) - updatedAt);
  if (deltaSec < 60) return "Updated just now";
  if (deltaSec < 3600) return `Updated ${Math.floor(deltaSec / 60)} mins ago`;
  if (deltaSec < 86400) return `Updated ${Math.floor(deltaSec / 3600)} hrs ago`;
  return `Updated ${Math.floor(deltaSec / 86400)} days ago`;
}

export function RateTrustBadge() {
  const { source, updatedAt } = useCurrency();
  const [nowMs, setNowMs] = useState(() => Date.now());

  useEffect(() => {
    const id = window.setInterval(() => setNowMs(Date.now()), 60_000);
    return () => window.clearInterval(id);
  }, []);

  const stale = useMemo(() => {
    if (!updatedAt) return true;
    return Math.floor(nowMs / 1000) - updatedAt > STALE_AFTER_SECONDS;
  }, [nowMs, updatedAt]);

  const wrapClass = stale
    ? "border-amber-400/35 bg-amber-500/10 text-amber-100"
    : "border-cyan-400/30 bg-cyan-500/10 text-cyan-100";

  return (
    <div
      className={`mt-2 inline-flex flex-wrap items-center gap-2 rounded-lg border px-2.5 py-1 text-[10px] tracking-wide ${wrapClass}`}
    >
      <span className="font-semibold uppercase">{sourceLabel(source)}</span>
      <span className="opacity-80">{formatUpdatedAgo(updatedAt, nowMs)}</span>
    </div>
  );
}
