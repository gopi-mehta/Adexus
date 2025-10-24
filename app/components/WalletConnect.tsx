"use client";

import { useAccount, useConnect, useDisconnect, useChainId } from "wagmi";
import { Button } from "./ui/Button";
import { getNetworkName, isSupportedNetwork } from "../lib/contracts/config";
import { useEffect, useState } from "react";

export function WalletConnect() {
  const [mounted, setMounted] = useState(false);
  const { address, isConnected } = useAccount();
  const { connect, connectors, isPending, error } = useConnect();
  const { disconnect } = useDisconnect();
  const chainId = useChainId();
  const [isConnecting, setIsConnecting] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Auto-connect on mount if connector is available (only for MiniApp)
  useEffect(() => {
    const connector = connectors[0];
    if (!isConnected && connector && connector.name === "Farcaster MiniApp") {
      connect({ connector });
    }
  }, [isConnected, connectors, connect]);

  if (!mounted) {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "12px",
          padding: "20px",
        }}
      >
        <div style={{ fontSize: "2rem" }}>⏳</div>
        <p>Loading...</p>
      </div>
    );
  }

  const truncateAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const handleConnect = async (connector: any) => {
    setIsConnecting(true);
    try {
      await connect({ connector });
    } catch (err) {
      console.error("Connection failed:", err);
    } finally {
      setIsConnecting(false);
    }
  };

  if (!isConnected) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        {connectors.length > 1 ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {connectors.map((connector) => (
              <Button
                key={connector.uid}
                onClick={() => handleConnect(connector)}
                variant="primary"
                size="sm"
                disabled={isPending || isConnecting}
              >
                {isPending || isConnecting
                  ? "Connecting..."
                  : `Connect ${connector.name}`}
              </Button>
            ))}
          </div>
        ) : (
          <Button
            onClick={() => {
              const connector = connectors[0];
              if (connector) {
                handleConnect(connector);
              }
            }}
            variant="primary"
            size="sm"
            disabled={isPending || isConnecting}
          >
            {isPending || isConnecting ? "Connecting..." : "Connect Wallet"}
          </Button>
        )}
        {error && (
          <div
            style={{
              fontSize: "0.75rem",
              color: "#dc2626",
              padding: "8px 12px",
              background: "#fef2f2",
              borderRadius: "8px",
              border: "1px solid #fecaca",
            }}
          >
            Connection failed: {error.message}
          </div>
        )}
      </div>
    );
  }

  const isSupported = isSupportedNetwork(chainId);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          background: isSupported ? "#f0f7ff" : "#fef3c7",
          padding: "8px 12px",
          borderRadius: "12px",
          border: isSupported ? "1px solid #bfdbfe" : "1px solid #fde68a",
        }}
      >
        <div
          style={{
            width: "8px",
            height: "8px",
            borderRadius: "50%",
            background: isSupported ? "#10b981" : "#f59e0b",
          }}
        />
        <div style={{ flex: 1 }}>
          <div
            style={{
              fontSize: "0.75rem",
              fontWeight: "600",
              color: isSupported ? "#1e40af" : "#92400e",
            }}
          >
            {truncateAddress(address || "")}
          </div>
          <div
            style={{
              fontSize: "0.625rem",
              color: isSupported ? "#3b82f6" : "#d97706",
            }}
          >
            {getNetworkName(chainId)}
          </div>
        </div>
        <Button onClick={() => disconnect()} variant="ghost" size="sm">
          Disconnect
        </Button>
      </div>

      {!isSupported && (
        <div
          style={{
            fontSize: "0.75rem",
            color: "#92400e",
            padding: "8px 12px",
            background: "#fef3c7",
            borderRadius: "8px",
            border: "1px solid #fde68a",
          }}
        >
          ⚠️ Please switch to Base or Base Sepolia network to use on-chain
          features
        </div>
      )}
    </div>
  );
}
