import { base, baseSepolia } from "wagmi/chains";

// Contract addresses for different networks
export const CONTRACT_ADDRESSES = {
  [baseSepolia.id]: {
    CampaignRegistry: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS_SEPOLIA || "",
  },
  [base.id]: {
    CampaignRegistry: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS_MAINNET || "",
  },
} as const;

// Token addresses on Base networks
export const TOKEN_ADDRESSES = {
  [baseSepolia.id]: {
    USDC: "0x036CbD53842c5426634e7929541eC2318f3dCF7e", // Base Sepolia USDC
    ETH: "0x0000000000000000000000000000000000000000", // Native ETH
  },
  [base.id]: {
    USDC: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913", // Base Mainnet USDC
    ETH: "0x0000000000000000000000000000000000000000", // Native ETH
  },
} as const;

// Campaign types
export enum CampaignType {
  VIDEO = 0,
  SURVEY = 1,
  QUIZ = 2,
  SHARE = 3,
}

// Helper to get contract address for current network
export function getContractAddress(chainId: number): string {
  return (
    CONTRACT_ADDRESSES[chainId as keyof typeof CONTRACT_ADDRESSES]
      ?.CampaignRegistry || ""
  );
}

// Helper to get token address
export function getTokenAddress(
  chainId: number,
  token: "USDC" | "ETH"
): string {
  return (
    TOKEN_ADDRESSES[chainId as keyof typeof TOKEN_ADDRESSES]?.[token] || ""
  );
}

// Check if we're on a supported network
export function isSupportedNetwork(chainId: number): boolean {
  return chainId === baseSepolia.id || chainId === base.id;
}

// Get network name
export function getNetworkName(chainId: number): string {
  if (chainId === baseSepolia.id) return "Base Sepolia";
  if (chainId === base.id) return "Base";
  return "Unknown Network";
}
