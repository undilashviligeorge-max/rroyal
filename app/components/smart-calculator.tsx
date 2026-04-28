"use client";

import { useMemo, useState } from "react";

import { calculateSmartRate } from "@/lib/pricing-engine";
import { useCurrency } from "@/app/contexts/price-provider";

export default function SmartCalculator() {
  const [amount, setAmount] = useState<number | string>(1000);

  const { resolvedMidQuote } = useCurrency();

  const bankBuyRate = resolvedMidQuote?.bankBuyRatePerUsd ?? 2.6500;
  const bankSellRate = resolvedMidQuote?.bankSellRatePerUsd ?? 2.7500;

  const pricing = useMemo(() => {
    const numAmount = typeof amount === "string" ? parseFloat(amount) : amount;
    return calculateSmartRate(
      isNaN(numAmount) ? 0 : numAmount,
      bankBuyRate,
      bankSellRate,
      0.2
    );
  }, [amount, bankBuyRate, bankSellRate]);

  return (
    <div className="w-full max-w-md mx-auto p-6 bg-[#050d14] border border-slate-800 rounded-2xl shadow-2xl text-[#e2e8f0] font-sans relative z-10">
      <div className="mb-6 text-center">
        <h2 className="text-xl font-bold tracking-wide text-white">
          Quantum Jump Transfer
        </h2>
        <p className="text-sm text-slate-400 mt-1">Smart Mid-Point Execution</p>
      </div>

      <div className="bg-slate-900/50 rounded-xl p-4 mb-4 border border-slate-800 focus-within:border-[#10b981] transition-colors">
        <label className="block text-xs font-medium text-slate-400 mb-2 uppercase tracking-wider">
          You Send (USD)
        </label>
        <div className="flex items-center">
          <span className="text-2xl text-slate-500 mr-2">$</span>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full bg-transparent text-3xl font-semibold text-white outline-none placeholder-slate-600"
            placeholder="0.00"
          />
        </div>
      </div>

      <div className="py-4 px-2 space-y-3 text-sm">
        <div className="flex justify-between items-center">
          <span className="text-slate-400">Standard Bank Rate</span>
          <span className="text-slate-300 font-mono line-through opacity-50">
            {pricing.bankBuyRate.toFixed(4)}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-[#10b981] font-medium">Smart Mid-Point Rate</span>
          <span className="text-[#10b981] font-mono font-bold">
            {pricing.smartMidPointRate.toFixed(4)}
          </span>
        </div>
        <div className="flex justify-between items-center border-t border-slate-800 pt-3">
          <span className="text-slate-400">Platform Fee</span>
          <span className="text-slate-300 font-mono">
            {pricing.platformFeeAmount > 0 ? "-" : ""}₾
            {pricing.platformFeeAmount.toFixed(2)}
          </span>
        </div>
        <p className="text-[10px] text-right text-slate-500 -mt-2">
          Includes 0.2% transparent platform fee
        </p>
      </div>

      <div className="bg-[#10b981]/10 rounded-xl p-4 mt-2 border border-[#10b981]/30">
        <label className="block text-xs font-medium text-[#10b981] mb-2 uppercase tracking-wider">
          Recipient Gets (GEL)
        </label>
        <div className="flex items-baseline justify-between">
          <span className="text-3xl font-bold text-white font-mono">
            ₾{pricing.finalAmountUserReceives.toFixed(2)}
          </span>
        </div>
      </div>

      {pricing.userSavings > 0 && (
        <div className="mt-6 flex items-center justify-center space-x-2 bg-emerald-900/20 py-2 px-4 rounded-lg border border-emerald-500/20">
          <span className="text-sm font-medium text-emerald-400">
            You save ₾{pricing.userSavings.toFixed(2)} vs. banks
          </span>
        </div>
      )}

      <button className="w-full mt-6 bg-[#10b981] hover:bg-emerald-400 text-[#050d14] font-bold text-lg py-4 rounded-xl transition-all shadow-[0_0_15px_rgba(16,185,129,0.3)] hover:shadow-[0_0_25px_rgba(16,185,129,0.5)]">
        Execute Jump
      </button>
    </div>
  );
}
