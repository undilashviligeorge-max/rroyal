"use client";

import "@rainbow-me/rainbowkit/styles.css";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RainbowKitProvider, darkTheme } from "@rainbow-me/rainbowkit";
import { WagmiProvider } from "wagmi";
import { sepolia } from "wagmi/chains";
import { useState, type ReactNode } from "react";

import { wagmiConfig } from "@/config/wagmi";

const base = darkTheme({
  accentColor: "#22d3ee",
  accentColorForeground: "#020617",
  borderRadius: "large",
  fontStack: "system",
  overlayBlur: "small",
});

const cosmicWalletTheme = {
  ...base,
  colors: {
    ...base.colors,
    modalBackground: "#0a0a0c",
    modalBorder: "rgba(34, 211, 238, 0.2)",
    modalText: "#f4f4f5",
    modalTextSecondary: "#a1a1aa",
    modalTextDim: "#71717a",
    generalBorder: "rgba(255,255,255,0.08)",
    generalBorderDim: "rgba(255,255,255,0.04)",
    actionButtonSecondaryBackground: "rgba(255,255,255,0.06)",
    menuItemBackground: "rgba(255,255,255,0.04)",
    connectButtonBackground: "#0c0c0f",
    connectButtonText: "#f4f4f5",
    connectButtonInnerBackground: "#18181b",
    modalBackdrop: "rgba(0, 0, 0, 0.75)",
  },
  shadows: {
    ...base.shadows,
    dialog: "0 24px 80px -20px rgba(0,0,0,0.85), 0 0 0 1px rgba(34,211,238,0.12)",
    connectButton: "0 0 24px rgba(34,211,238,0.15)",
  },
};

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider
          initialChain={sepolia}
          modalSize="compact"
          theme={cosmicWalletTheme}
          appInfo={{
            appName: "RROYAL DEX",
            learnMoreUrl: "https://ethereum.org/en/developers/docs/networks/",
          }}
        >
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
