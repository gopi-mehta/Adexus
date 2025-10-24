"use client";
import { ReactNode, useEffect, useState } from "react";
import { baseSepolia } from "wagmi/chains";
import { OnchainKitProvider } from "@coinbase/onchainkit";
import { WagmiProvider } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { wagmiConfig } from "./lib/wagmiConfig";
import { sdk } from "@farcaster/miniapp-sdk";
import "@coinbase/onchainkit/styles.css";

const queryClient = new QueryClient();

export function RootProvider({ children }: { children: ReactNode }) {
  const [_mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    // Call ready() to hide the Farcaster splash screen
    // This is required for Mini Apps to display properly
    sdk.actions.ready().catch((error) => {
      console.error("Failed to call sdk.actions.ready():", error);
    });
  }, []);

  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <OnchainKitProvider
          apiKey={process.env.NEXT_PUBLIC_ONCHAINKIT_API_KEY}
          chain={baseSepolia}
          config={{
            appearance: {
              mode: "auto",
            },
            wallet: {
              display: "modal",
              preference: "all",
            },
          }}
          miniKit={{
            enabled: false, // Disable MiniKit for now to prevent errors
            autoConnect: false,
            notificationProxyUrl: undefined,
          }}
        >
          {children}
        </OnchainKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
