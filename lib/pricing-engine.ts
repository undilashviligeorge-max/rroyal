export interface PricingResult {
  amountToSend: number;
  bankBuyRate: number;
  bankSellRate: number;
  smartMidPointRate: number;
  platformFeePercentage: number;
  platformFeeAmount: number;
  finalAmountUserReceives: number;
  userSavings: number;
}

export function calculateSmartRate(
  amountToSend: number,
  bankBuyRate: number,
  bankSellRate: number,
  platformFeePct: number = 0.2
): PricingResult {
  if (!amountToSend || amountToSend <= 0)
    return {
      amountToSend: 0,
      bankBuyRate,
      bankSellRate,
      smartMidPointRate: 0,
      platformFeePercentage: platformFeePct,
      platformFeeAmount: 0,
      finalAmountUserReceives: 0,
      userSavings: 0,
    };

  const smartMidPointRate = (bankBuyRate + bankSellRate) / 2;
  const rawConvertedAmount = amountToSend * smartMidPointRate;
  const feeAmount = rawConvertedAmount * (platformFeePct / 100);
  const finalAmount = rawConvertedAmount - feeAmount;
  const amountInStandardBank = amountToSend * bankBuyRate;
  const savings = finalAmount - amountInStandardBank;

  return {
    amountToSend,
    bankBuyRate,
    bankSellRate,
    smartMidPointRate: Number(smartMidPointRate.toFixed(4)),
    platformFeePercentage: platformFeePct,
    platformFeeAmount: Number(feeAmount.toFixed(2)),
    finalAmountUserReceives: Number(finalAmount.toFixed(2)),
    userSavings: Number(savings.toFixed(2)),
  };
}
