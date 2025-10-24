"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "../components/ui/Button";
import { Progress } from "../components/ui/Progress";
import { useUserCampaigns } from "../lib/dataService";
import { Campaign } from "../lib/dataService";
import { useCampaignContract } from "../lib/contracts/useCampaignContract";
import styles from "./page.module.css";

function ManageCampaignsContent() {
  const router = useRouter();
  const { campaigns, isLoading, error } = useUserCampaigns();
  const { toggleCampaignStatus, withdrawUnusedFunds, isWritePending } =
    useCampaignContract();
  const [filter, setFilter] = useState<"all" | "active" | "paused" | "ended">(
    "all"
  );
  const [isProcessing, setIsProcessing] = useState<string | null>(null);

  const getStatus = (campaign: Campaign): "active" | "paused" | "ended" => {
    const expiresAt = new Date(campaign.expiresAt);
    const now = new Date();

    if (expiresAt < now) return "ended";
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
      // The UI will update automatically when the blockchain data refreshes
    } catch (error) {
      console.error("Error toggling campaign status:", error);
      alert("Failed to toggle campaign status. Please try again.");
    } finally {
      setIsProcessing(null);
    }
  };

  const handleWithdrawFunds = async (campaignId: string) => {
    try {
      setIsProcessing(campaignId);
      await withdrawUnusedFunds(parseInt(campaignId));
      alert("Unused funds withdrawn successfully!");
    } catch (error) {
      console.error("Error withdrawing funds:", error);
      alert("Failed to withdraw funds. Please try again.");
    } finally {
      setIsProcessing(null);
    }
  };

  const handleEdit = (campaignId: string) => {
    // Navigate to edit page (to be implemented)
    alert("Edit functionality will be implemented in a future update.");
  };

  const handleViewAnalytics = (campaignId: string) => {
    // Navigate to analytics page (to be implemented)
    console.log("View analytics for campaign:", campaignId);
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <button className={styles.backButton} onClick={() => router.push("/")}>
          ← Back to Dashboard
        </button>

        <div className={styles.headerTop}>
          <div className={styles.headerContent}>
            <img
              src="/Adexus logo.png"
              alt="Adexus Logo"
              className={styles.appLogo}
            />
            <div>
              <h1 className={styles.title}>Manage Campaigns</h1>
              <p className={styles.subtitle}>
                Track and manage your active campaigns
              </p>
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
              ${totalRewardsDistributed.toFixed(2)}
            </div>
            <div className={styles.statLabel}>Rewards Distributed</div>
          </div>
        </div>
      </div>

      <div className={styles.filterBar}>
        {[
          { id: "all", label: "All Campaigns" },
          { id: "active", label: "Active" },
          { id: "paused", label: "Paused" },
          { id: "ended", label: "Ended" },
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
                      ${rewardsDistributed.toFixed(2)}
                    </div>
                    <div className={styles.campaignStatLabel}>Distributed</div>
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
                    onClick={() => handleToggleStatus(campaign.id)}
                    disabled={isProcessing === campaign.id || isWritePending}
                  >
                    {isProcessing === campaign.id
                      ? "⏳ Processing..."
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
                    onClick={() => handleWithdrawFunds(campaign.id)}
                    disabled={isProcessing === campaign.id || isWritePending}
                  >
                    {isProcessing === campaign.id
                      ? "⏳ Processing..."
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
