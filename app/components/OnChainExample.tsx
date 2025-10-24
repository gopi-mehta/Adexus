"use client";

import { useState, useEffect } from "react";
import { useAccount, useChainId } from "wagmi";
import { useCampaignContract } from "../lib/contracts/useCampaignContract";
import { getNetworkName, isSupportedNetwork } from "../lib/contracts/config";
import { Button } from "./ui/Button";
import { Card, CardBody } from "./ui/Card";

/**
 * OnChainExample Component
 *
 * This component demonstrates how to integrate on-chain functionality
 * without breaking existing features. It's designed to be optional and
 * can be gradually integrated into your app.
 *
 * Usage:
 * 1. Ensure user has connected wallet
 * 2. Ensure contract is deployed on current network
 * 3. Use this as reference for integrating blockchain features
 */
export function OnChainExample() {
  const [mounted, setMounted] = useState(false);
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { useCampaignCounter, useUserTotalEarnings, contractAddress } =
    useCampaignContract();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Card>
        <CardBody>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              padding: "40px 20px",
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: "2rem", marginBottom: "16px" }}>⏳</div>
            <p>Loading...</p>
          </div>
        </CardBody>
      </Card>
    );
  }

  // Read contract data
  const { data: campaignCounter } = useCampaignCounter();
  const { data: totalEarnings } = useUserTotalEarnings(address);

  const [showDetails, setShowDetails] = useState(false);

  // Check if on supported network
  const isSupported = isSupportedNetwork(chainId);
  const networkName = getNetworkName(chainId);

  if (!isConnected) {
    return (
      <Card>
        <CardBody>
          <div style={{ padding: "16px", textAlign: "center" }}>
            <p style={{ color: "#64748b", marginBottom: "16px" }}>
              Connect your wallet to see on-chain features
            </p>
          </div>
        </CardBody>
      </Card>
    );
  }

  if (!isSupported) {
    return (
      <Card>
        <CardBody>
          <div style={{ padding: "16px" }}>
            <p style={{ color: "#ef4444", marginBottom: "8px" }}>
              ⚠️ Unsupported Network
            </p>
            <p style={{ color: "#64748b", fontSize: "0.875rem" }}>
              Please switch to Base or Base Sepolia to use on-chain features.
            </p>
            <p
              style={{
                color: "#64748b",
                fontSize: "0.875rem",
                marginTop: "8px",
              }}
            >
              Current network: {networkName}
            </p>
          </div>
        </CardBody>
      </Card>
    );
  }

  if (!contractAddress) {
    return (
      <Card>
        <CardBody>
          <div style={{ padding: "16px" }}>
            <p style={{ color: "#f59e0b", marginBottom: "8px" }}>
              ⚠️ Contract Not Deployed
            </p>
            <p style={{ color: "#64748b", fontSize: "0.875rem" }}>
              Smart contracts haven't been deployed to this network yet. Check
              BLOCKCHAIN_SETUP.md for deployment instructions.
            </p>
          </div>
        </CardBody>
      </Card>
    );
  }

  return (
    <Card>
      <CardBody>
        <div style={{ padding: "16px" }}>
          <div style={{ marginBottom: "16px" }}>
            <h3
              style={{
                fontSize: "1rem",
                fontWeight: "600",
                marginBottom: "4px",
              }}
            >
              🔗 On-Chain Status
            </h3>
            <p style={{ fontSize: "0.75rem", color: "#64748b" }}>
              Connected to {networkName}
            </p>
          </div>

          <div
            style={{
              background: "#f8fafc",
              padding: "12px",
              borderRadius: "8px",
              marginBottom: "12px",
            }}
          >
            <div style={{ marginBottom: "8px" }}>
              <span style={{ fontSize: "0.75rem", color: "#64748b" }}>
                Total Campaigns:
              </span>
              <span
                style={{
                  fontSize: "0.875rem",
                  fontWeight: "600",
                  marginLeft: "8px",
                }}
              >
                {campaignCounter ? campaignCounter.toString() : "0"}
              </span>
            </div>

            <div>
              <span style={{ fontSize: "0.75rem", color: "#64748b" }}>
                Your Earnings:
              </span>
              <span
                style={{
                  fontSize: "0.875rem",
                  fontWeight: "600",
                  marginLeft: "8px",
                  color: "#10b981",
                }}
              >
                {totalEarnings
                  ? `${(Number(totalEarnings) / 1e18).toFixed(4)} ETH`
                  : "0 ETH"}
              </span>
            </div>
          </div>

          <Button
            onClick={() => setShowDetails(!showDetails)}
            variant="ghost"
            size="sm"
            fullWidth
          >
            {showDetails ? "Hide" : "Show"} Technical Details
          </Button>

          {showDetails && (
            <div
              style={{
                marginTop: "12px",
                padding: "12px",
                background: "#f8fafc",
                borderRadius: "8px",
                fontSize: "0.75rem",
                fontFamily: "monospace",
              }}
            >
              <div style={{ marginBottom: "4px" }}>
                <strong>Contract:</strong>
                <br />
                {contractAddress}
              </div>
              <div style={{ marginBottom: "4px" }}>
                <strong>Your Address:</strong>
                <br />
                {address}
              </div>
              <div>
                <strong>Chain ID:</strong> {chainId}
              </div>
            </div>
          )}

          <div
            style={{
              marginTop: "16px",
              padding: "12px",
              background: "#dbeafe",
              borderRadius: "8px",
            }}
          >
            <p style={{ fontSize: "0.75rem", color: "#1e40af", margin: 0 }}>
              💡 <strong>Developer Note:</strong> This component shows how to
              integrate on-chain features. You can gradually replace mock data
              with real blockchain data using the hooks in{" "}
              <code>useCampaignContract.ts</code>.
            </p>
          </div>
        </div>
      </CardBody>
    </Card>
  );
}
