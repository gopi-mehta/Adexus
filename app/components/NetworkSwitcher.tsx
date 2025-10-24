"use client";

import { useState, useEffect } from "react";
import { useAccount, useSwitchChain } from "wagmi";
import { baseSepolia } from "wagmi/chains";
import { Button } from "./ui/Button";

export function NetworkSwitcher() {
  const [mounted, setMounted] = useState(false);
  const { chain } = useAccount();
  const { switchChain } = useSwitchChain();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  // Only show if not on Base Sepolia
  if (chain?.id === baseSepolia.id) {
    return null;
  }

  return (
    <div
      style={{
        padding: "12px",
        background: "#fef3c7",
        borderRadius: "8px",
        border: "1px solid #fde68a",
        fontSize: "0.875rem",
        color: "#92400e",
      }}
    >
      <div style={{ fontWeight: "600", marginBottom: "8px" }}>
        🔄 Switch Network Required
      </div>
      <div style={{ marginBottom: "8px" }}>
        You're currently on {chain?.name || "Unknown Network"}. The contract is
        deployed on Base Sepolia testnet.
      </div>
      <Button
        onClick={() => switchChain({ chainId: baseSepolia.id })}
        variant="primary"
        size="sm"
      >
        Switch to Base Sepolia
      </Button>
    </div>
  );
}
