"use client";

import { useMemo, useEffect, useState } from "react";
import { formatEther } from "viem";
import { useAccount } from "wagmi";
import {
  useCampaignContract,
  CampaignData,
  formatCampaignForUI,
} from "./contracts/useCampaignContract";
import { ipfsService, CampaignMetadata } from "./ipfs";

// Type definitions
export interface Campaign {
  id: string;
  creator: string;
  brandName: string;
  brandLogo: string;
  title: string;
  description: string;
  type: "video" | "survey" | "share" | "quiz";
  reward: number;
  rewardToken: string;
  duration: number;
  participantsCount: number;
  maxParticipants: number;
  expiresAt: string;
  isActive: boolean;
  difficulty: "easy" | "medium" | "hard";
  tags: string[];
  totalFunded: number;
  totalPaid: number;
  videoUrl?: string;
  videoDuration?: number; // in seconds
  surveyQuestions?: Array<{
    id: string;
    question: string;
    type: "single" | "multiple" | "rating";
    options?: string[];
  }>;
  quizQuestions?: Array<{
    question: string;
    options: string[];
    correctAnswer: number;
    explanation?: string;
  }>;
  shareMessage?: string;
  sharePreviewText?: string;
}

export interface UserProgress {
  userId: string;
  totalEarned: number;
  campaignsCompleted: number;
  completedCampaignIds: string[];
  inProgressCampaignIds: string[];
}

// Real data service that fetches from blockchain
export function useRealCampaigns() {
  const { useCampaigns, useCampaignCounter } = useCampaignContract();

  // Get total number of campaigns
  const { data: campaignCounter } = useCampaignCounter();
  const totalCampaigns = campaignCounter ? Number(campaignCounter) : 0;

  // Fetch all campaigns (we'll start with the first 20)
  const {
    data: campaignsData,
    isLoading,
    error,
  } = useCampaigns(
    totalCampaigns > 0 ? 1 : 0,
    totalCampaigns > 0 ? Math.min(totalCampaigns, 20) : 0
  );

  // State for campaigns with metadata
  const [campaignsWithMetadata, setCampaignsWithMetadata] = useState<
    Campaign[]
  >([]);
  const [_isLoadingMetadata, setIsLoadingMetadata] = useState(false);

  // Fetch metadata for campaigns
  useEffect(() => {
    if (!campaignsData || !Array.isArray(campaignsData)) {
      setCampaignsWithMetadata([]);
      return;
    }

    const fetchMetadata = async () => {
      setIsLoadingMetadata(true);
      try {
        const campaignsWithMeta = await Promise.all(
          campaignsData.map(async (campaign: CampaignData) => {
            const formatted = formatCampaignForUI(campaign);

            // Try to fetch metadata from IPFS
            let metadata: CampaignMetadata | null = null;
            if (ipfsService.isValidIPFSUri(campaign.metadataURI)) {
              metadata = await ipfsService.fetchMetadata(campaign.metadataURI);
            }

            // Check if this is a placeholder campaign (created with old system)
            const _isPlaceholderCampaign =
              campaign.metadataURI.includes("placeholder-");

            // Use metadata if available, otherwise return null for missing data
            if (!metadata) {
              return null; // Skip campaigns without metadata
            }

            return {
              id: formatted.id,
              creator: formatted.creator,
              brandName: metadata.brandName,
              brandLogo: metadata.brandLogo,
              title: metadata.title,
              description: metadata.description,
              type: formatted.type as "video" | "survey" | "share" | "quiz",
              reward: parseFloat(formatted.rewardAmount),
              rewardToken: "ETH", // This would be determined from the token address
              duration: metadata.duration,
              participantsCount: formatted.participantsCount,
              maxParticipants: formatted.maxParticipants,
              expiresAt: formatted.expiresAt,
              isActive: formatted.isActive,
              totalFunded: formatted.totalFunded,
              totalPaid: formatted.totalPaid,
              difficulty: metadata.difficulty,
              tags: metadata.tags,
              // Include type-specific data from metadata
              videoUrl: metadata.videoUrl,
              videoDuration: metadata.videoDuration,
              surveyQuestions: metadata.surveyQuestions,
              quizQuestions: metadata.quizQuestions,
              shareMessage: metadata.shareMessage,
              sharePreviewText: metadata.sharePreviewText,
            };
          })
        );

        // Filter out campaigns without metadata
        const validCampaigns = campaignsWithMeta.filter(
          (campaign) => campaign !== null
        );
        setCampaignsWithMetadata(validCampaigns);
      } catch (error) {
        console.error("Failed to fetch campaign metadata:", error);
        // Don't show campaigns if metadata fetch fails
        setCampaignsWithMetadata([]);
      } finally {
        setIsLoadingMetadata(false);
      }
    };

    fetchMetadata();
  }, [campaignsData]);

  // Transform blockchain data to UI format with memoization
  const campaigns: Campaign[] = useMemo(() => {
    return campaignsWithMetadata;
  }, [campaignsWithMetadata]);

  return {
    campaigns,
    isLoading,
    error,
    totalCampaigns,
  };
}

// Real user progress from blockchain
export function useRealUserProgress() {
  const { useUserTotalEarnings, useUserCompletedCampaigns } =
    useCampaignContract();

  const { data: totalEarnings } = useUserTotalEarnings();
  const { data: completedCampaigns } = useUserCompletedCampaigns();

  const userProgress: UserProgress = useMemo(
    () => ({
      userId: "blockchain-user", // This would be the actual user address
      totalEarned: totalEarnings
        ? parseFloat(formatEther(totalEarnings as bigint))
        : 0,
      campaignsCompleted: completedCampaigns
        ? (completedCampaigns as bigint[]).length
        : 0,
      completedCampaignIds: completedCampaigns
        ? (completedCampaigns as bigint[]).map((id) => id.toString())
        : [],
      inProgressCampaignIds: [], // Not tracked on-chain yet
    }),
    [totalEarnings, completedCampaigns]
  );

  return userProgress;
}

// Real data service - no fallback to mock data
export function useHybridCampaigns() {
  return useRealCampaigns();
}

// Get campaigns created by the current user
export function useUserCampaigns() {
  const { useCampaigns, useCampaignCounter } = useCampaignContract();
  const { address } = useAccount();

  // Get total number of campaigns
  const { data: campaignCounter } = useCampaignCounter();
  const totalCampaigns = campaignCounter ? Number(campaignCounter) : 0;

  // Fetch all campaigns (we'll start with the first 20)
  const {
    data: campaignsData,
    isLoading,
    error,
  } = useCampaigns(
    totalCampaigns > 0 ? 1 : 0,
    totalCampaigns > 0 ? Math.min(totalCampaigns, 20) : 0
  );

  // State for campaigns with metadata
  const [userCampaigns, setUserCampaigns] = useState<Campaign[]>([]);
  const [isLoadingMetadata, setIsLoadingMetadata] = useState(false);

  // Fetch metadata for campaigns and filter by creator
  useEffect(() => {
    if (!campaignsData || !Array.isArray(campaignsData)) {
      setUserCampaigns([]);
      return;
    }

    const fetchUserCampaigns = async () => {
      setIsLoadingMetadata(true);
      try {
        const allCampaignsWithMeta = await Promise.all(
          campaignsData.map(async (campaign: CampaignData) => {
            const formatted = formatCampaignForUI(campaign);

            // Try to fetch metadata from IPFS
            let metadata: CampaignMetadata | null = null;
            if (ipfsService.isValidIPFSUri(campaign.metadataURI)) {
              metadata = await ipfsService.fetchMetadata(campaign.metadataURI);
            }

            // Check if this is a placeholder campaign (created with old system)
            const _isPlaceholderCampaign =
              campaign.metadataURI.includes("placeholder-");

            // Use metadata if available, otherwise return null for missing data
            if (!metadata) {
              return null;
            }

            return {
              ...formatted,
              ...metadata,
              creator: campaign.creator,
              reward: parseFloat(formatted.rewardAmount),
              rewardToken:
                campaign.rewardToken ===
                "0x0000000000000000000000000000000000000000"
                  ? "ETH"
                  : "TOKEN",
            } as Campaign;
          })
        );

        // Filter out null campaigns and campaigns not created by current user
        const validCampaigns = allCampaignsWithMeta.filter(
          (campaign) => campaign && campaign.creator === address
        ) as Campaign[];

        setUserCampaigns(validCampaigns);
      } catch (error) {
        console.error("Error fetching user campaigns:", error);
        setUserCampaigns([]);
      } finally {
        setIsLoadingMetadata(false);
      }
    };

    fetchUserCampaigns();
  }, [campaignsData, address]);

  return {
    campaigns: userCampaigns,
    isLoading: isLoading || isLoadingMetadata,
    error,
    totalCampaigns: userCampaigns.length,
  };
}

// Create a campaign on-chain
export function useCreateCampaign() {
  const { createCampaign, isWritePending, isConfirmed, writeError } =
    useCampaignContract();

  const createCampaignOnChain = async (campaignData: {
    title: string;
    description: string;
    type: "video" | "survey" | "share" | "quiz";
    reward: number;
    maxParticipants: number;
    expiresAt: string;
    duration: string;
    difficulty: "easy" | "medium" | "hard";
    tags: string;
    brandName: string;
    brandLogo: string;
    // Type-specific data
    videoUrl?: string;
    surveyQuestions?: Array<{
      id: string;
      question: string;
      type: "single" | "multiple" | "rating";
      options?: string[];
    }>;
    quizQuestions?: Array<{
      question: string;
      options: string[];
      correctAnswer: number;
      explanation?: string;
    }>;
    shareMessage?: string;
    sharePreviewText?: string;
  }) => {
    // Convert campaign type to enum
    const campaignTypeMap = {
      video: 0,
      survey: 1,
      quiz: 2,
      share: 3,
    };

    // Calculate dynamic initial funding
    // Formula: (Max Participants × Reward per Participant) + Platform Fee
    const totalRewardsNeeded =
      campaignData.maxParticipants * campaignData.reward;
    const platformFeePercentage = 2.5; // 2.5% platform fee
    const platformFee = (totalRewardsNeeded * platformFeePercentage) / 100;
    const initialFunding = totalRewardsNeeded + platformFee;

    // Create metadata object
    const metadata = {
      title: campaignData.title,
      description: campaignData.description,
      type: campaignData.type,
      brandName: campaignData.brandName,
      brandLogo: campaignData.brandLogo,
      duration: parseInt(campaignData.duration),
      difficulty: campaignData.difficulty,
      tags: campaignData.tags
        .split(",")
        .map((tag) => tag.trim())
        .filter((tag) => tag.length > 0),
      videoUrl: campaignData.videoUrl,
      surveyQuestions: campaignData.surveyQuestions,
      quizQuestions: campaignData.quizQuestions,
      shareMessage: campaignData.shareMessage,
      sharePreviewText: campaignData.sharePreviewText,
    };

    // Upload metadata to IPFS
    const metadataURI = await ipfsService.uploadMetadata(metadata);

    return createCampaign({
      metadataURI,
      campaignType: campaignTypeMap[campaignData.type],
      rewardToken: "0x0000000000000000000000000000000000000000", // ETH
      rewardAmount: campaignData.reward.toString(),
      maxParticipants: campaignData.maxParticipants,
      expiresAt: Math.floor(new Date(campaignData.expiresAt).getTime() / 1000),
      initialFunding: initialFunding.toString(), // Dynamic funding based on campaign parameters
    });
  };

  return {
    createCampaign: createCampaignOnChain,
    isCreating: isWritePending,
    isCreated: isConfirmed,
    error: writeError,
  };
}
