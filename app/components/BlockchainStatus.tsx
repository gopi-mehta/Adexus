"use client";

import { useState, useEffect } from "react";
import { useCampaignContract } from "../lib/contracts/useCampaignContract";
import { useAccount, useChainId } from "wagmi";
import { getNetworkName, isSupportedNetwork } from "../lib/contracts/config";

export function BlockchainStatus() {
  const [mounted, setMounted] = useState(false);
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { contractAddress, useCampaignCounter } = useCampaignContract();
  const { data: campaignCounter, isLoading } = useCampaignCounter();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div
        style={{
          padding: "12px",
          background: "#f3f4f6",
          borderRadius: "8px",
          border: "1px solid #d1d5db",
          textAlign: "center",
        }}
      >
        <div style={{ fontSize: "1.5rem", marginBottom: "8px" }}>⏳</div>
        <p>Loading...</p>
      </div>
    );
  }

  if (!isConnected) {
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
        🔗 Connect wallet to view blockchain data
      </div>
    );
  }

  const isSupported = isSupportedNetwork(chainId);

  return (
    <div
      style={{
        padding: "12px",
        background: isSupported ? "#f0f7ff" : "#fef3c7",
        borderRadius: "8px",
        border: isSupported ? "1px solid #bfdbfe" : "1px solid #fde68a",
        fontSize: "0.875rem",
        color: isSupported ? "#1e40af" : "#92400e",
      }}
    >
      <div style={{ fontWeight: "600", marginBottom: "4px" }}>
        🔗 Blockchain Status
      </div>
      <div style={{ fontSize: "0.75rem", marginBottom: "4px" }}>
        Network: {getNetworkName(chainId)}
      </div>
      <div style={{ fontSize: "0.75rem", marginBottom: "4px" }}>
        Contract:{" "}
        {contractAddress
          ? `${contractAddress.slice(0, 6)}...${contractAddress.slice(-4)}`
          : "Not deployed"}
      </div>
      <div style={{ fontSize: "0.75rem" }}>
        Campaigns:{" "}
        {isLoading
          ? "Loading..."
          : campaignCounter
          ? Number(campaignCounter)
          : 0}
      </div>
      {!isSupported && (
        <div
          style={{ marginTop: "8px", fontSize: "0.75rem", color: "#92400e" }}
        >
          ⚠️ Switch to Base or Base Sepolia for full functionality
        </div>
      )}
    </div>
  );
}
