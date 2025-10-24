import { createConfig, http } from "wagmi";
import { base, baseSepolia } from "wagmi/chains";
import { farcasterMiniApp } from "@farcaster/miniapp-wagmi-connector";
import { injected, metaMask, walletConnect } from "wagmi/connectors";

// Check if we're in a Farcaster MiniApp environment
const isMiniAppEnvironment =
  typeof window !== "undefined" &&
  (window.parent !== window || window.location !== window.parent.location);

export const wagmiConfig = createConfig({
  chains: [base, baseSepolia],
  transports: {
    [base.id]: http(),
    [baseSepolia.id]: http(),
  },
  connectors: isMiniAppEnvironment
    ? [farcasterMiniApp()]
    : [
        injected(),
        metaMask(),
        ...(process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID &&
        process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID !== "your-project-id"
          ? [
              walletConnect({
                projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID,
              }),
            ]
          : []),
      ],
});
