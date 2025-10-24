"use client";

import { ReactNode, useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { Card, CardBody } from "./ui/Card";
import { WalletConnect } from "./WalletConnect";

interface WalletGateProps {
  children: ReactNode;
  message?: string;
}

/**
 * WalletGate Component
 *
 * Wraps content that requires a connected wallet.
 * Shows wallet connect prompt if user is not connected.
 */
export function WalletGate({
  children,
  message = "Please connect your wallet to continue",
}: WalletGateProps) {
  const [mounted, setMounted] = useState(false);
  const { isConnected, address } = useAccount();

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

  if (!isConnected || !address) {
    return (
      <Card>
        <CardBody>
          <div
            style={{
              padding: "40px 20px",
              textAlign: "center",
            }}
          >
            <div
              style={{
                fontSize: "3rem",
                marginBottom: "16px",
              }}
            >
              🔐
            </div>
            <h3
              style={{
                fontSize: "1.25rem",
                fontWeight: "700",
                color: "#0f172a",
                marginBottom: "8px",
              }}
            >
              Wallet Connection Required
            </h3>
            <p
              style={{
                color: "#64748b",
                marginBottom: "24px",
                fontSize: "0.875rem",
              }}
            >
              {message}
            </p>
            <div style={{ maxWidth: "400px", margin: "0 auto" }}>
              <WalletConnect />
            </div>

            <div
              style={{
                marginTop: "24px",
                padding: "16px",
                background: "#f0f7ff",
                borderRadius: "12px",
                border: "1px solid #bfdbfe",
              }}
            >
              <p
                style={{
                  fontSize: "0.75rem",
                  color: "#1e40af",
                  margin: 0,
                }}
              >
                💡 <strong>Why do I need to connect?</strong>
                <br />
                Your wallet address identifies you on-chain and allows you to:
                <br />• Create campaigns and fund rewards
                <br />• Complete campaigns and receive tokens
                <br />• Track your earnings and participation
              </p>
            </div>
          </div>
        </CardBody>
      </Card>
    );
  }

  return <>{children}</>;
}
