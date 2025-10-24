"use client";
import { ReactNode, useEffect, useState } from "react";

interface ClientWrapperProps {
  children: ReactNode;
}

export function ClientWrapper({ children }: ClientWrapperProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
          fontSize: "1.125rem",
          color: "#64748b",
        }}
      >
        Loading...
      </div>
    );
  }

  return <>{children}</>;
}
