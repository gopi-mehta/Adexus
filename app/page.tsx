"use client";
import { useState, useEffect } from "react";
import { useQuickAuth } from "@coinbase/onchainkit/minikit";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Navigation, FilterBar } from "./components/Navigation";
import { CampaignCard } from "./components/CampaignCard";
import { UserInfo } from "./components/UserInfo";
import { WalletConnect } from "./components/WalletConnect";
import { Campaign } from "./lib/dataService";
import { useRealCampaigns, useRealUserProgress } from "./lib/dataService";
import { ClientWrapper } from "./components/ClientWrapper";
import styles from "./page.module.css";

interface AuthResponse {
  success: boolean;
  user?: {
    fid: number;
    issuedAt?: number;
    expiresAt?: number;
  };
  message?: string;
}

function HomeContent() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<
    "campaigns" | "rewards" | "creator"
  >("campaigns");
  const [activeFilter, setActiveFilter] = useState("all");
  // Use real data from blockchain
  const {
    campaigns: realCampaigns,
    isLoading: campaignsLoading,
    error: campaignsError,
  } = useRealCampaigns();
  const userProgress = useRealUserProgress();
  const [allCampaigns, setAllCampaigns] = useState<Campaign[]>([]);

  // Update campaigns when real data changes
  useEffect(() => {
    if (realCampaigns && realCampaigns.length > 0) {
      setAllCampaigns(realCampaigns);
    } else if (realCampaigns && realCampaigns.length === 0) {
      // If no blockchain campaigns, ensure we show empty state
      setAllCampaigns([]);
    }
  }, [realCampaigns, campaignsLoading, campaignsError]);

  // No longer using localStorage - only blockchain data

  const { data: _authData } = useQuickAuth<AuthResponse>("/api/auth", {
    method: "GET",
  });

  const filteredCampaigns = allCampaigns.filter((campaign) => {
    if (activeFilter === "all") return true;
    return campaign.type === activeFilter;
  });

  const handleCampaignClick = (campaignId: string) => {
    router.push(`/campaign/${campaignId}`);
  };

  return (
    <div className={styles.container}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.headerTop}>
          <div className={styles.headerLeft}>
            <Image
              src="/Adexus_horizontal.png"
              alt="Adexus Logo"
              width={140}
              height={40}
              className={styles.appLogoHorizontal}
            />
          </div>
          <div className={styles.headerRight}>
            <UserInfo />
            <WalletConnect />
          </div>
        </div>
      </header>

      {/* Navigation */}
      <Navigation activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Campaigns Tab */}
      {activeTab === "campaigns" && (
        <div className={styles.content}>
          <div className={styles.statsBar}>
            <div className={styles.stat}>
              <div className={styles.statValue}>{filteredCampaigns.length}</div>
              <div className={styles.statLabel}>Active Campaigns</div>
            </div>
            <div className={styles.stat}>
              <div className={styles.statValue}>
                {userProgress.totalEarned.toFixed(4) + " " + "ETH"}
              </div>
              <div className={styles.statLabel}>Total Earned</div>
            </div>
            <div className={styles.stat}>
              <div className={styles.statValue}>
                {userProgress.campaignsCompleted}
              </div>
              <div className={styles.statLabel}>Completed</div>
            </div>
          </div>

          <FilterBar
            activeFilter={activeFilter}
            onFilterChange={setActiveFilter}
          />

          {campaignsLoading ? (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}>⏳</div>
              <h3 className={styles.emptyTitle}>Loading campaigns...</h3>
              <p className={styles.emptyText}>Fetching data from blockchain</p>
            </div>
          ) : campaignsError ? (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}>⚠️</div>
              <h3 className={styles.emptyTitle}>Error loading campaigns</h3>
              <p className={styles.emptyText}>
                {campaignsError.message || "Failed to connect to blockchain"}
              </p>
            </div>
          ) : (
            <>
              <div className={styles.campaignGrid}>
                {filteredCampaigns.map((campaign) => (
                  <CampaignCard
                    key={campaign.id}
                    campaign={campaign}
                    onClick={() => handleCampaignClick(campaign.id)}
                    isCompleted={userProgress.completedCampaignIds.includes(
                      campaign.id
                    )}
                  />
                ))}
              </div>

              {filteredCampaigns.length === 0 && (
                <div className={styles.emptyState}>
                  <div className={styles.emptyIcon}>🔍</div>
                  <h3 className={styles.emptyTitle}>No campaigns found</h3>
                  <p className={styles.emptyText}>Try adjusting your filters</p>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Rewards Tab */}
      {activeTab === "rewards" && (
        <div className={styles.content}>
          <div className={styles.rewardsHeader}>
            <div className={styles.totalEarnings}>
              <div className={styles.earningsLabel}>Total Earnings</div>
              <div className={styles.earningsAmount}>
                {userProgress.totalEarned.toFixed(6)} ETH
              </div>
              <div className={styles.earningsSubtext}>
                Across {userProgress.campaignsCompleted} campaigns
              </div>
            </div>
          </div>

          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>Recent Activity</h2>
            <div className={styles.activityList}>
              {allCampaigns
                .filter((c) => userProgress.completedCampaignIds.includes(c.id))
                .map((campaign) => (
                  <div key={campaign.id} className={styles.activityItem}>
                    <div className={styles.activityIcon}>
                      {campaign.brandLogo}
                    </div>
                    <div className={styles.activityDetails}>
                      <div className={styles.activityTitle}>
                        {campaign.title}
                      </div>
                      <div className={styles.activityMeta}>
                        Completed • {campaign.brandName}
                      </div>
                    </div>
                    <div className={styles.activityReward}>
                      + {campaign.reward} {campaign.rewardToken || "ETH"}
                    </div>
                  </div>
                ))}
              {userProgress.completedCampaignIds.length === 0 && (
                <div className={styles.emptyState}>
                  <div className={styles.emptyIcon}>📝</div>
                  <h3 className={styles.emptyTitle}>
                    No completed campaigns yet
                  </h3>
                  <p className={styles.emptyText}>
                    Complete campaigns to see your activity here
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Creator Tab */}
      {activeTab === "creator" && (
        <div className={styles.content}>
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>Campaign Creator Hub</h2>
            {/* <p style={{ color: "#64748b", marginBottom: "24px" }}>
              Create and manage campaigns to engage users and grow your brand
            </p> */}

            <div style={{ display: "grid", gap: "16px" }}>
              <div
                style={{
                  background: "white",
                  border: "1px solid #e5e7eb",
                  borderRadius: "16px",
                  padding: "24px",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                }}
                onClick={() => router.push("/create-campaign")}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow =
                    "0 4px 12px rgba(0, 0, 0, 0.1)";
                  e.currentTarget.style.transform = "translateY(-2px)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = "none";
                  e.currentTarget.style.transform = "translateY(0)";
                }}
              >
                <h3
                  style={{
                    fontSize: "1.125rem",
                    fontWeight: "700",
                    color: "#0f172a",
                    marginBottom: "8px",
                  }}
                >
                  Create New Campaign
                </h3>
                <p
                  style={{ fontSize: "0.875rem", color: "#64748b", margin: 0 }}
                >
                  Launch a new campaign to engage users with videos, surveys,
                  quizzes, or social sharing
                </p>
              </div>

              <div
                style={{
                  background: "white",
                  border: "1px solid #e5e7eb",
                  borderRadius: "16px",
                  padding: "24px",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                }}
                onClick={() => router.push("/manage-campaigns")}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow =
                    "0 4px 12px rgba(0, 0, 0, 0.1)";
                  e.currentTarget.style.transform = "translateY(-2px)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = "none";
                  e.currentTarget.style.transform = "translateY(0)";
                }}
              >
                <h3
                  style={{
                    fontSize: "1.125rem",
                    fontWeight: "700",
                    color: "#0f172a",
                    marginBottom: "8px",
                  }}
                >
                  Manage Campaigns
                </h3>
                <p
                  style={{ fontSize: "0.875rem", color: "#64748b", margin: 0 }}
                >
                  View analytics, track performance, and manage your active
                  campaigns
                </p>
              </div>
            </div>
          </div>

          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>Why Create Campaigns?</h2>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                gap: "16px",
              }}
            >
              {[
                {
                  icon: "👥",
                  title: "Engage Your Audience",
                  description: "Connect with users in meaningful ways",
                },
                {
                  icon: "📈",
                  title: "Drive Growth",
                  description: "Increase brand awareness and reach",
                },
                {
                  icon: "💡",
                  title: "Gather Insights",
                  description: "Learn from user feedback and behavior",
                },
                {
                  icon: "🎁",
                  title: "Reward Participation",
                  description: "Incentivize actions with crypto rewards",
                },
              ].map((item, idx) => (
                <div
                  key={idx}
                  style={{
                    background: "white",
                    border: "1px solid #e5e7eb",
                    borderRadius: "12px",
                    padding: "20px",
                    textAlign: "center",
                  }}
                >
                  <div style={{ fontSize: "2rem", marginBottom: "12px" }}>
                    {item.icon}
                  </div>
                  <h4
                    style={{
                      fontSize: "0.875rem",
                      fontWeight: "600",
                      color: "#0f172a",
                      marginBottom: "4px",
                    }}
                  >
                    {item.title}
                  </h4>
                  <p
                    style={{
                      fontSize: "0.75rem",
                      color: "#64748b",
                      margin: 0,
                    }}
                  >
                    {item.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function Home() {
  return (
    <ClientWrapper>
      <HomeContent />
    </ClientWrapper>
  );
}
