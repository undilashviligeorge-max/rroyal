"use client";

import "@rainbow-me/rainbowkit/styles.css";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RainbowKitProvider, lightTheme } from "@rainbow-me/rainbowkit";
import { WagmiProvider } from "wagmi";
import { sepolia } from "wagmi/chains";
import { useState, type ReactNode } from "react";

import { wagmiConfig } from "@/config/wagmi";

const rroyalRainbowTheme = lightTheme({
  accentColor: "#18181b",
  accentColorForeground: "#ffffff",
  borderRadius: "large",
  fontStack: "system",
  overlayBlur: "small",
});

const bankingTheme = {
  ...rroyalRainbowTheme,
  colors: {
    ...rroyalRainbowTheme.colors,
    modalBackground: "#ffffff",
    modalBorder: "#e4e4e7",
    modalText: "#18181b",
    modalTextSecondary: "#52525b",
    modalTextDim: "#a1a1aa",
    generalBorder: "#e4e4e7",
    generalBorderDim: "#f4f4f5",
    actionButtonSecondaryBackground: "#fafafa",
    menuItemBackground: "#fafafa",
    connectButtonBackground: "#18181b",
    connectButtonText: "#ffffff",
    connectButtonInnerBackground: "#27272a",
    modalBackdrop: "rgba(9, 9, 11, 0.45)",
  },
  shadows: {
    ...rroyalRainbowTheme.shadows,
    dialog:
      "0 25px 50px -12px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(0, 0, 0, 0.04)",
    connectButton: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
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
          theme={bankingTheme}
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
