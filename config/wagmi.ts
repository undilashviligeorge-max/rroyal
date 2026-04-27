import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { sepolia } from "wagmi/chains";

export const wagmiConfig = getDefaultConfig({
  appName: "RROYAL DEX",
  // RainbowKit maps the literal "YOUR_PROJECT_ID" to a demo Cloud ID for local dev.
  // Set NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID in .env.local for production (https://cloud.reown.com).
  projectId:
    process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "YOUR_PROJECT_ID",
  chains: [sepolia],
  ssr: true,
});
