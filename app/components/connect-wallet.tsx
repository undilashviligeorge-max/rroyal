"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";

export function ConnectWallet() {
  return (
    <div className="flex shrink-0 items-center [&_[data-rk]]:font-medium">
      <ConnectButton chainStatus="none" showBalance={false} />
    </div>
  );
}
