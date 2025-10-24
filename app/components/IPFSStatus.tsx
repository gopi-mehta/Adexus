"use client";

import { useState, useEffect } from "react";
import { ipfsService } from "../lib/ipfs";

export function IPFSStatus() {
  const [mounted, setMounted] = useState(false);
  const [ipfsMode, setIpfsMode] = useState<"production" | "unconfigured">(
    "unconfigured"
  );
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  useEffect(() => {
    setMounted(true);

    // Check if Pinata is configured
    const status = ipfsService.getStatus();
    setIpfsMode(status.mode);
  }, []);

  const testConnection = async () => {
    setTesting(true);
    setTestResult(null);

    try {
      const result = await ipfsService.testPinataConnection();
      setTestResult(result);
    } catch (error) {
      setTestResult({
        success: false,
        message: `Test failed: ${(error as Error).message}`,
      });
    } finally {
      setTesting(false);
    }
  };

  if (!mounted) {
    return null;
  }

  return (
    <div
      style={{
        padding: "12px",
        background: ipfsMode === "production" ? "#f0fdf4" : "#fef2f2",
        borderRadius: "8px",
        border:
          ipfsMode === "production" ? "1px solid #bbf7d0" : "1px solid #fecaca",
        fontSize: "0.875rem",
        color: ipfsMode === "production" ? "#166534" : "#991b1b",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "4px",
        }}
      >
        <div style={{ fontWeight: "600" }}>
          {ipfsMode === "production" ? "📡" : "⚠️"} IPFS Storage
        </div>
        {ipfsMode === "production" && (
          <button
            onClick={testConnection}
            disabled={testing}
            style={{
              padding: "4px 8px",
              fontSize: "0.7rem",
              border: "1px solid #166534",
              borderRadius: "4px",
              background: testing ? "#d1d5db" : "white",
              color: "#166534",
              cursor: testing ? "not-allowed" : "pointer",
              fontWeight: "500",
            }}
          >
            {testing ? "Testing..." : "Test"}
          </button>
        )}
      </div>
      <div style={{ fontSize: "0.75rem", marginBottom: "4px" }}>
        Mode:{" "}
        {ipfsMode === "production" ? "Production (Pinata)" : "Not Configured"}
      </div>

      {testResult && (
        <div
          style={{
            fontSize: "0.75rem",
            marginTop: "8px",
            padding: "8px",
            borderRadius: "4px",
            background: testResult.success
              ? "rgba(22, 163, 74, 0.1)"
              : "rgba(220, 38, 38, 0.1)",
            border: testResult.success
              ? "1px solid rgba(22, 163, 74, 0.3)"
              : "1px solid rgba(220, 38, 38, 0.3)",
            color: testResult.success ? "#166534" : "#991b1b",
          }}
        >
          {testResult.success ? "✅" : "❌"} {testResult.message}
        </div>
      )}

      {ipfsMode === "unconfigured" && (
        <div style={{ fontSize: "0.75rem", marginTop: "4px" }}>
          ❌ Pinata not configured. Campaign creation will fail.
          <br />
          <strong>Required:</strong> Set NEXT_PUBLIC_PINATA_JWT in .env.local
          <br />
          See IPFS_SETUP.md for setup instructions.
        </div>
      )}
      {ipfsMode === "production" && !testResult && (
        <div style={{ fontSize: "0.75rem", marginTop: "4px" }}>
          ✓ All campaigns fetched fresh from IPFS
          <br />✓ Data accessible across all devices
        </div>
      )}
    </div>
  );
}
