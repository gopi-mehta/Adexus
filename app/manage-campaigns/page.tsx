"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "../components/ui/Button";
import { Progress } from "../components/ui/Progress";
import { useUserCampaigns } from "../lib/dataService";
import { Campaign } from "../lib/dataService";
import { useCampaignContract } from "../lib/contracts/useCampaignContract";
import { useQueryClient } from "@tanstack/react-query";
import styles from "./page.module.css";

function ManageCampaignsContent() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { campaigns, isLoading, error } = useUserCampaigns();
  const { toggleCampaignStatus, withdrawUnusedFunds, isWritePending } =
    useCampaignContract();
  const [filter, setFilter] = useState<
    "all" | "active" | "paused" | "ended" | "discontinued"
  >("all");
  const [isProcessing, setIsProcessing] = useState<string | null>(null);

  const getStatus = (
    campaign: Campaign
  ): "active" | "paused" | "ended" | "discontinued" => {
    const expiresAt = new Date(campaign.expiresAt);
    const now = new Date();

    // Check if funds have been withdrawn (discontinued)
    const unusedFunds = campaign.totalFunded - campaign.totalPaid;
    const remainingSpots =
      campaign.maxParticipants - campaign.participantsCount;
    const platformFeePercentage = 0.025;
    const reservedPlatformFees =
      remainingSpots * campaign.reward * platformFeePercentage;
    const hasWithdrawnFunds = unusedFunds < reservedPlatformFees + 0.0001; // Small buffer for rounding

    if (expiresAt < now) return "ended";
    if (hasWithdrawnFunds && !campaign.isActive) return "discontinued";
    if (!campaign.isActive) return "paused";
    return "active";
  };

  const filteredCampaigns = campaigns.filter((campaign) => {
    if (filter === "all") return true;
    return getStatus(campaign) === filter;
  });

  const totalParticipants = campaigns.reduce(
    (sum, c) => sum + c.participantsCount,
    0
  );
  const totalRewardsDistributed = campaigns.reduce(
    (sum, c) => sum + c.participantsCount * c.reward,
    0
  );
  const activeCampaigns = campaigns.filter(
    (c) => getStatus(c) === "active"
  ).length;

  const handleToggleStatus = async (campaignId: string) => {
    try {
      setIsProcessing(campaignId);
      await toggleCampaignStatus(parseInt(campaignId));

      // Wait a moment for blockchain to update, then refresh all queries
      setTimeout(() => {
        queryClient.invalidateQueries();
      }, 2000);

      alert("Campaign status updated successfully!");
    } catch (error) {
      console.error("Error toggling campaign status:", error);
      alert("Failed to toggle campaign status. Please try again.");
    } finally {
      setIsProcessing(null);
    }
  };

  const handleWithdrawFunds = async (campaignId: string) => {
    console.log("🔵 Withdraw button clicked for campaign:", campaignId);

    try {
      setIsProcessing(campaignId);
      console.log("🔵 Processing state set, calling withdrawUnusedFunds...");

      // Note: Smart contract will handle the actual withdrawal
      // UI shows withdrawable amount excluding platform fees for transparency
      const result = await withdrawUnusedFunds(parseInt(campaignId));
      console.log("✅ Withdrawal transaction submitted:", result);

      // Wait a moment for blockchain to update, then refresh all queries
      setTimeout(() => {
        console.log("🔄 Refreshing campaign data...");
        queryClient.invalidateQueries();
      }, 2000);

      alert(
        "Funds withdrawn successfully!\n\nNote: Platform fees (2.5%) for unfilled spots remain reserved in the contract."
      );
    } catch (error) {
      console.error("❌ Error withdrawing funds:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      alert(
        `Failed to withdraw funds: ${errorMessage}\n\nPlease ensure the campaign is paused or expired, and you have funds available to withdraw.`
      );
    } finally {
      console.log("🔵 Processing complete, clearing state");
      setIsProcessing(null);
    }
  };

  const handleEdit = (_campaignId: string) => {
    // Navigate to edit page (to be implemented)
    alert("Edit functionality will be implemented in a future update.");
  };

  const handleViewAnalytics = (campaignId: string) => {
    // Navigate to analytics page (to be implemented)
    console.log("View analytics for campaign:", campaignId);
    alert(
      "Analytics feature coming soon!\n\nThis will show detailed metrics including:\n• View counts\n• Completion rates\n• Engagement statistics\n• Revenue breakdown"
    );
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <button className={styles.backButton} onClick={() => router.push("/")}>
          ← Back to Dashboard
        </button>

        <div className={styles.headerTop}>
          <div className={styles.headerContent}>
            <div className={styles.logoTitleWrapper}>
              <Image
                src="/Adexus_horizontal.png"
                alt="Adexus Logo"
                width={120}
                height={36}
                className={styles.appLogo}
              />
              <div>
                <h1 className={styles.title}>Manage Campaigns</h1>
                <p className={styles.subtitle}>
                  Track and manage your active campaigns
                </p>
              </div>
            </div>
          </div>
          <Button onClick={() => router.push("/create-campaign")} size="md">
            + Create Campaign
          </Button>
        </div>

        <div className={styles.statsGrid}>
          <div className={styles.stat}>
            <div className={styles.statValue}>{campaigns.length}</div>
            <div className={styles.statLabel}>Total Campaigns</div>
          </div>
          <div className={styles.stat}>
            <div className={styles.statValue}>{activeCampaigns}</div>
            <div className={styles.statLabel}>Active</div>
          </div>
          <div className={styles.stat}>
            <div className={styles.statValue}>
              {totalParticipants.toLocaleString()}
            </div>
            <div className={styles.statLabel}>Total Participants</div>
          </div>
          <div className={styles.stat}>
            <div className={styles.statValue}>
              {totalRewardsDistributed.toFixed(4)} ETH
            </div>
            <div className={styles.statLabel}>Rewards Distributed</div>
          </div>
        </div>

        <div
          style={{
            marginTop: "16px",
            padding: "12px 16px",
            background: "#f0f7ff",
            border: "1px solid #bfdbfe",
            borderRadius: "12px",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <span style={{ fontSize: "1rem" }}>💡</span>
          <p
            style={{
              margin: 0,
              fontSize: "0.75rem",
              color: "#1e40af",
              lineHeight: "1.5",
            }}
          >
            <strong>Withdrawable funds:</strong> Platform fees (2.5%) are
            reserved for unfilled campaign spots. You can only withdraw funds
            after accounting for these reserved fees.
          </p>
        </div>
      </div>

      <div className={styles.filterBar}>
        {[
          { id: "all", label: "All Campaigns" },
          { id: "active", label: "Active" },
          { id: "paused", label: "Paused" },
          { id: "ended", label: "Ended" },
          { id: "discontinued", label: "Discontinued" },
        ].map((f) => (
          <button
            key={f.id}
            className={`${styles.filterButton} ${
              filter === f.id ? styles.active : ""
            }`}
            onClick={() => setFilter(f.id as typeof filter)}
          >
            {f.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>⏳</div>
          <h3 className={styles.emptyTitle}>Loading campaigns...</h3>
          <p className={styles.emptyText}>Fetching data from blockchain</p>
        </div>
      ) : error ? (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>⚠️</div>
          <h3 className={styles.emptyTitle}>Error loading campaigns</h3>
          <p className={styles.emptyText}>
            {error.message || "Failed to connect to blockchain"}
          </p>
        </div>
      ) : filteredCampaigns.length === 0 ? (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>📋</div>
          <h3 className={styles.emptyTitle}>
            {campaigns.length === 0
              ? "No campaigns yet"
              : "No campaigns match this filter"}
          </h3>
          <p className={styles.emptyText}>
            {campaigns.length === 0
              ? "Create your first campaign to start engaging users and rewarding participation"
              : "Try adjusting your filters"}
          </p>
          {campaigns.length === 0 && (
            <Button onClick={() => router.push("/create-campaign")} size="lg">
              Create Your First Campaign
            </Button>
          )}
        </div>
      ) : (
        <div className={styles.campaignList}>
          {filteredCampaigns.map((campaign) => {
            const status = getStatus(campaign);
            const progress =
              (campaign.participantsCount / campaign.maxParticipants) * 100;
            const rewardsDistributed =
              campaign.participantsCount * campaign.reward;
            const unusedFunds = campaign.totalFunded - campaign.totalPaid;

            // Calculate platform fees for remaining spots (2.5%)
            const remainingSpots =
              campaign.maxParticipants - campaign.participantsCount;
            const platformFeePercentage = 0.025; // 2.5%
            const reservedPlatformFees =
              remainingSpots * campaign.reward * platformFeePercentage;

            // Withdrawable amount excludes platform fees for unfilled spots
            const withdrawableAmount = Math.max(
              0,
              unusedFunds - reservedPlatformFees
            );

            const canWithdraw =
              (!campaign.isActive ||
                new Date(campaign.expiresAt) < new Date()) &&
              withdrawableAmount > 0;

            // Debug logging
            console.log(`Campaign ${campaign.id} withdrawal check:`, {
              isActive: campaign.isActive,
              expiresAt: campaign.expiresAt,
              isExpired: new Date(campaign.expiresAt) < new Date(),
              unusedFunds,
              withdrawableAmount,
              canWithdraw,
            });

            return (
              <div key={campaign.id} className={styles.campaignCard}>
                <div className={styles.campaignHeader}>
                  <div className={styles.campaignInfo}>
                    <div className={styles.campaignBrand}>
                      <span className={styles.campaignLogo}>
                        {campaign.brandLogo}
                      </span>
                      <span className={styles.campaignBrandName}>
                        {campaign.brandName}
                      </span>
                    </div>
                    <h3 className={styles.campaignTitle}>{campaign.title}</h3>
                    <p className={styles.campaignDescription}>
                      {campaign.description}
                    </p>
                  </div>
                  <span className={`${styles.statusBadge} ${styles[status]}`}>
                    <span className={styles.statusDot}></span>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </span>
                </div>

                <div className={styles.campaignStats}>
                  <div className={styles.campaignStat}>
                    <div className={styles.campaignStatValue}>
                      {campaign.participantsCount.toLocaleString()}
                    </div>
                    <div className={styles.campaignStatLabel}>Participants</div>
                  </div>
                  <div className={styles.campaignStat}>
                    <div className={styles.campaignStatValue}>
                      {rewardsDistributed.toFixed(4)} ETH
                    </div>
                    <div className={styles.campaignStatLabel}>Distributed</div>
                  </div>
                  <div className={styles.campaignStat}>
                    <div className={styles.campaignStatValue}>
                      {withdrawableAmount.toFixed(4)} ETH
                    </div>
                    <div className={styles.campaignStatLabel}>Withdrawable</div>
                  </div>
                  <div className={styles.campaignStat}>
                    <div className={styles.campaignStatValue}>
                      {(
                        campaign.maxParticipants - campaign.participantsCount
                      ).toLocaleString()}
                    </div>
                    <div className={styles.campaignStatLabel}>Spots Left</div>
                  </div>
                  <div className={styles.campaignStat}>
                    <div className={styles.campaignStatValue}>
                      {new Date(campaign.expiresAt).toLocaleDateString(
                        "en-US",
                        {
                          month: "short",
                          day: "numeric",
                        }
                      )}
                    </div>
                    <div className={styles.campaignStatLabel}>Expires</div>
                  </div>
                </div>

                <div className={styles.progressBar}>
                  <div className={styles.progressInfo}>
                    <span className={styles.progressLabel}>Progress</span>
                    <span className={styles.progressValue}>
                      {campaign.participantsCount} / {campaign.maxParticipants}
                    </span>
                  </div>
                  <Progress
                    value={progress}
                    variant={progress > 80 ? "warning" : "primary"}
                  />
                </div>

                <div className={styles.campaignActions}>
                  <button
                    className={`${styles.actionButton} ${styles.primary}`}
                    onClick={() => handleViewAnalytics(campaign.id)}
                  >
                    📊 View Analytics
                  </button>
                  <button
                    className={styles.actionButton}
                    onClick={() => {
                      if (status === "discontinued") {
                        alert(
                          "❌ Cannot Resume Discontinued Campaign\n\n" +
                            "This campaign has been discontinued after funds were withdrawn. " +
                            "Discontinued campaigns cannot be resumed.\n\n" +
                            "Please create a new campaign if you want to continue engaging with users."
                        );
                        return;
                      }
                      handleToggleStatus(campaign.id);
                    }}
                    disabled={
                      isProcessing === campaign.id ||
                      isWritePending ||
                      status === "discontinued"
                    }
                    style={{
                      opacity: status === "discontinued" ? 0.5 : 1,
                      cursor:
                        status === "discontinued" ? "not-allowed" : "pointer",
                    }}
                    title={
                      status === "discontinued"
                        ? "Cannot resume - campaign discontinued after withdrawal"
                        : campaign.isActive
                        ? "Pause campaign"
                        : "Resume campaign"
                    }
                  >
                    {isProcessing === campaign.id
                      ? "⏳ Processing..."
                      : status === "discontinued"
                      ? "🚫 Discontinued"
                      : campaign.isActive
                      ? "⏸️ Pause"
                      : "▶️ Resume"}
                  </button>
                  <button
                    className={styles.actionButton}
                    onClick={() => handleEdit(campaign.id)}
                  >
                    ✏️ Edit
                  </button>
                  <button
                    className={`${styles.actionButton} ${styles.danger}`}
                    onClick={() => {
                      if (!canWithdraw) {
                        if (
                          campaign.isActive &&
                          new Date(campaign.expiresAt) >= new Date()
                        ) {
                          alert(
                            "⏸️ Campaign Must Be Paused First\n\n" +
                              "You cannot withdraw funds while the campaign is active. " +
                              "Please pause the campaign using the '⏸️ Pause' button, then try withdrawing again.\n\n" +
                              `Withdrawable amount: ${withdrawableAmount.toFixed(
                                4
                              )} ETH`
                          );
                        } else if (
                          withdrawableAmount === 0 &&
                          unusedFunds > 0
                        ) {
                          alert(
                            "Platform Fees Reserved\n\n" +
                              `${reservedPlatformFees.toFixed(
                                4
                              )} ETH is reserved as platform fees (2.5%) for the remaining ${remainingSpots} unfilled spots.\n\n` +
                              "These fees will be released when spots are filled or the campaign ends."
                          );
                        } else {
                          alert("No funds available to withdraw.");
                        }
                        return;
                      }
                      handleWithdrawFunds(campaign.id);
                    }}
                    disabled={isProcessing === campaign.id || isWritePending}
                    style={{
                      opacity: canWithdraw ? 1 : 0.5,
                      cursor: canWithdraw ? "pointer" : "not-allowed",
                    }}
                    title={
                      !canWithdraw
                        ? campaign.isActive &&
                          new Date(campaign.expiresAt) >= new Date()
                          ? "⏸️ Pause campaign first to withdraw funds"
                          : withdrawableAmount === 0 && unusedFunds > 0
                          ? `Platform fees (${reservedPlatformFees.toFixed(
                              4
                            )} ETH) reserved for remaining ${remainingSpots} spots`
                          : "No funds available to withdraw"
                        : `Withdraw ${withdrawableAmount.toFixed(
                            4
                          )} ETH (excludes platform fees)`
                    }
                  >
                    {isProcessing === campaign.id
                      ? "⏳ Processing..."
                      : withdrawableAmount > 0
                      ? `💰 Withdraw ${withdrawableAmount.toFixed(4)} ETH`
                      : "💰 Withdraw Funds"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function ManageCampaigns() {
  return <ManageCampaignsContent />;
}
