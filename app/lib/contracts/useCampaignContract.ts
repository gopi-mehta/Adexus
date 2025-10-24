"use client";

import { useCallback } from "react";
import {
  useAccount,
  useChainId,
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import { parseEther, formatEther } from "viem";
import { getContractAddress, CampaignType, getTokenAddress } from "./config";
import CampaignRegistryABI from "./CampaignRegistry.json";

export interface CampaignData {
  id: bigint;
  creator: string;
  metadataURI: string;
  campaignType: number;
  rewardToken: string;
  rewardAmount: bigint;
  maxParticipants: bigint;
  participantsCount: bigint;
  expiresAt: bigint;
  isActive: boolean;
  totalFunded: bigint;
  totalPaid: bigint;
}

export function useCampaignContract() {
  const chainId = useChainId();
  const { address } = useAccount();
  const contractAddress = getContractAddress(chainId);

  const {
    writeContractAsync,
    data: hash,
    isPending: isWritePending,
    error: writeError,
  } = useWriteContract();

  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({
      hash,
    });

  // Read campaign data
  const useCampaign = useCallback(
    (campaignId: number) => {
      return useReadContract({
        address: contractAddress as `0x${string}`,
        abi: CampaignRegistryABI.abi,
        functionName: "getCampaign",
        args: [BigInt(campaignId)],
      });
    },
    [contractAddress]
  );

  // Read multiple campaigns
  const useCampaigns = useCallback(
    (startId: number, count: number) => {
      return useReadContract({
        address: contractAddress as `0x${string}`,
        abi: CampaignRegistryABI.abi,
        functionName: "getCampaigns",
        args: [BigInt(startId), BigInt(count)],
        query: {
          enabled: startId > 0 && count > 0, // Only call if we have valid parameters
        },
      });
    },
    [contractAddress]
  );

  // Check if user has participated
  const useHasParticipated = useCallback(
    (campaignId: number, userAddress?: string) => {
      return useReadContract({
        address: contractAddress as `0x${string}`,
        abi: CampaignRegistryABI.abi,
        functionName: "userHasParticipated",
        args: [BigInt(campaignId), userAddress || address],
      });
    },
    [contractAddress, address]
  );

  // Get user's total earnings
  const useUserTotalEarnings = useCallback(
    (userAddress?: string) => {
      return useReadContract({
        address: contractAddress as `0x${string}`,
        abi: CampaignRegistryABI.abi,
        functionName: "userTotalEarnings",
        args: [userAddress || address],
      });
    },
    [contractAddress, address]
  );

  // Get user's completed campaigns
  const useUserCompletedCampaigns = useCallback(
    (userAddress?: string) => {
      return useReadContract({
        address: contractAddress as `0x${string}`,
        abi: CampaignRegistryABI.abi,
        functionName: "getUserCompletedCampaigns",
        args: [userAddress || address],
      });
    },
    [contractAddress, address]
  );

  // Get campaign counter
  const useCampaignCounter = useCallback(() => {
    return useReadContract({
      address: contractAddress as `0x${string}`,
      abi: CampaignRegistryABI.abi,
      functionName: "campaignCounter",
    });
  }, [contractAddress]);

  // Write functions

  // Create a campaign
  const createCampaign = useCallback(
    async (params: {
      metadataURI: string;
      campaignType: CampaignType;
      rewardToken: string;
      rewardAmount: string; // in ETH/token units
      maxParticipants: number;
      expiresAt: number; // Unix timestamp
      initialFunding?: string; // For ETH campaigns
    }) => {
      if (!contractAddress)
        throw new Error("Contract not deployed on this network");

      const isETHCampaign =
        params.rewardToken === getTokenAddress(chainId, "ETH");

      return writeContractAsync({
        address: contractAddress as `0x${string}`,
        abi: CampaignRegistryABI.abi,
        functionName: "createCampaign",
        args: [
          params.metadataURI,
          params.campaignType,
          params.rewardToken as `0x${string}`,
          parseEther(params.rewardAmount),
          BigInt(params.maxParticipants),
          BigInt(params.expiresAt),
        ],
        value:
          isETHCampaign && params.initialFunding
            ? parseEther(params.initialFunding)
            : BigInt(0),
      });
    },
    [contractAddress, chainId, writeContractAsync]
  );

  // Fund a campaign
  const fundCampaign = useCallback(
    async (campaignId: number, amount: string, isETH: boolean = false) => {
      if (!contractAddress)
        throw new Error("Contract not deployed on this network");

      return writeContractAsync({
        address: contractAddress as `0x${string}`,
        abi: CampaignRegistryABI.abi,
        functionName: "fundCampaign",
        args: [BigInt(campaignId), isETH ? BigInt(0) : parseEther(amount)],
        value: isETH ? parseEther(amount) : BigInt(0),
      });
    },
    [contractAddress, writeContractAsync]
  );

  // Complete a campaign
  const completeCampaign = useCallback(
    async (campaignId: number) => {
      if (!contractAddress)
        throw new Error("Contract not deployed on this network");

      return writeContractAsync({
        address: contractAddress as `0x${string}`,
        abi: CampaignRegistryABI.abi,
        functionName: "completeCampaign",
        args: [BigInt(campaignId)],
      });
    },
    [contractAddress, writeContractAsync]
  );

  // Toggle campaign status
  const toggleCampaignStatus = useCallback(
    async (campaignId: number) => {
      if (!contractAddress)
        throw new Error("Contract not deployed on this network");

      return writeContractAsync({
        address: contractAddress as `0x${string}`,
        abi: CampaignRegistryABI.abi,
        functionName: "toggleCampaignStatus",
        args: [BigInt(campaignId)],
      });
    },
    [contractAddress, writeContractAsync]
  );

  // Withdraw unused funds
  const withdrawUnusedFunds = useCallback(
    async (campaignId: number) => {
      if (!contractAddress)
        throw new Error("Contract not deployed on this network");

      return writeContractAsync({
        address: contractAddress as `0x${string}`,
        abi: CampaignRegistryABI.abi,
        functionName: "withdrawUnusedFunds",
        args: [BigInt(campaignId)],
      });
    },
    [contractAddress, writeContractAsync]
  );

  return {
    // Contract info
    contractAddress,
    chainId,

    // Read hooks
    useCampaign,
    useCampaigns,
    useHasParticipated,
    useUserTotalEarnings,
    useUserCompletedCampaigns,
    useCampaignCounter,

    // Write functions
    createCampaign,
    fundCampaign,
    completeCampaign,
    toggleCampaignStatus,
    withdrawUnusedFunds,

    // Transaction state
    hash,
    isWritePending,
    isConfirming,
    isConfirmed,
    writeError,
  };
}

// Helper to format campaign data for UI
export function formatCampaignForUI(campaign: CampaignData) {
  return {
    id: campaign.id.toString(),
    creator: campaign.creator,
    metadataURI: campaign.metadataURI,
    type: getCampaignTypeName(campaign.campaignType),
    rewardAmount: formatEther(campaign.rewardAmount),
    maxParticipants: Number(campaign.maxParticipants),
    participantsCount: Number(campaign.participantsCount),
    expiresAt: new Date(Number(campaign.expiresAt) * 1000).toISOString(),
    isActive: campaign.isActive,
    progress:
      (Number(campaign.participantsCount) / Number(campaign.maxParticipants)) *
      100,
  };
}

function getCampaignTypeName(type: number): string {
  switch (type) {
    case CampaignType.VIDEO:
      return "video";
    case CampaignType.SURVEY:
      return "survey";
    case CampaignType.QUIZ:
      return "quiz";
    case CampaignType.SHARE:
      return "share";
    default:
      return "unknown";
  }
}
