"use client";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAccount } from "wagmi";
import { Campaign } from "../../lib/dataService";
import { useRealCampaigns } from "../../lib/dataService";
import { useCampaignContract } from "../../lib/contracts/useCampaignContract";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
import { Progress } from "../../components/ui/Progress";
import { WalletConnect } from "../../components/WalletConnect";
import styles from "./page.module.css";

function CampaignPageContent() {
  const router = useRouter();
  const params = useParams();
  const { address, isConnected } = useAccount();
  const { campaigns: realCampaigns, isLoading } = useRealCampaigns();
  const {
    completeCampaign,
    useHasParticipated,
    isWritePending,
    isConfirmed: _isConfirmed,
    writeError: _writeError,
  } = useCampaignContract();
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [isCreator, setIsCreator] = useState(false);
  const [hasAlreadyParticipated, setHasAlreadyParticipated] = useState(false);
  const [step, setStep] = useState<"intro" | "action" | "complete">("intro");
  const [progress, setProgress] = useState(0);

  // Video state
  const [videoProgress, setVideoProgress] = useState(0);
  const [videoWatched, setVideoWatched] = useState(false);

  // Survey state
  const [surveyAnswers, setSurveyAnswers] = useState<Record<string, any>>({});
  const [currentQuestion, setCurrentQuestion] = useState(0);

  // Quiz state
  const [quizAnswers, setQuizAnswers] = useState<number[]>([]);
  const [currentQuizQuestion, setCurrentQuizQuestion] = useState(0);
  const [quizScore, setQuizScore] = useState(0);

  // Share state
  const [shareClicked, setShareClicked] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);

  // Check if user has already participated
  const campaignId = params.id as string;
  const { data: hasParticipated } = useHasParticipated(
    parseInt(campaignId),
    address
  );

  useEffect(() => {
    // First try to find in real campaigns
    if (realCampaigns) {
      const foundCampaign = realCampaigns.find((c) => c.id === campaignId);
      if (foundCampaign) {
        setCampaign(foundCampaign);
        // Check if current user is the creator
        setIsCreator(
          !!(
            address &&
            foundCampaign.creator.toLowerCase() === address.toLowerCase()
          )
        );
        // Check if user has already participated
        if (hasParticipated) {
          setHasAlreadyParticipated(true);
        }
        return;
      }
    }

    // No longer using localStorage - only blockchain data

    // If not found anywhere, show error
    if (!isLoading) {
      console.error("Campaign not found:", campaignId);
    }
  }, [
    params.id,
    realCampaigns,
    isLoading,
    address,
    campaignId,
    hasParticipated,
  ]);

  if (!campaign) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Loading campaign...</div>
      </div>
    );
  }

  const handleStart = () => {
    setStep("action");
    if (campaign.type === "video") {
      simulateVideoProgress();
    }
  };

  const simulateVideoProgress = () => {
    if (!campaign.videoDuration) {
      // Fallback to 5 minutes if no duration available
      const fallbackDuration = 5 * 60; // 5 minutes in seconds
      simulateProgressWithDuration(fallbackDuration);
      return;
    }

    // Use actual video duration from metadata
    simulateProgressWithDuration(campaign.videoDuration);
  };

  const simulateProgressWithDuration = (durationInSeconds: number) => {
    let currentProgress = 0;
    const totalSteps = 100;
    const stepInterval = (durationInSeconds * 1000) / totalSteps; // Convert to milliseconds per step

    const interval = setInterval(() => {
      currentProgress += 1;
      setVideoProgress(currentProgress);
      setProgress((currentProgress / 100) * 100);

      if (currentProgress >= 100) {
        clearInterval(interval);
        setVideoWatched(true);
      }
    }, stepInterval);
  };

  const handleSurveyAnswer = (questionId: string, answer: any) => {
    setSurveyAnswers((prev) => ({ ...prev, [questionId]: answer }));
  };

  const handleNextQuestion = () => {
    const questions = campaign.surveyQuestions || [];
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion((prev) => prev + 1);
      setProgress(((currentQuestion + 2) / questions.length) * 100);
    } else {
      completeCampaignAction();
    }
  };

  const handleQuizAnswer = (answerIndex: number) => {
    const questions = campaign.quizQuestions || [];
    const newAnswers = [...quizAnswers];
    newAnswers[currentQuizQuestion] = answerIndex;
    setQuizAnswers(newAnswers);

    if (currentQuizQuestion < questions.length - 1) {
      setCurrentQuizQuestion((prev) => prev + 1);
      setProgress(((currentQuizQuestion + 2) / questions.length) * 100);
    } else {
      // Calculate score
      let score = 0;
      questions.forEach((q: any, idx: number) => {
        if (newAnswers[idx] === q.correctAnswer) score++;
      });
      setQuizScore(score);
      completeCampaignAction();
    }
  };

  const handleShare = () => {
    setShareClicked(true);
    // Simulate share action
    setTimeout(() => {
      completeCampaignAction();
    }, 1000);
  };

  const completeCampaignAction = async () => {
    if (!campaign || !isConnected) {
      console.error("Campaign not found or wallet not connected");
      return;
    }

    setIsCompleting(true);
    try {
      // Prepare campaign response data
      const campaignResponse = {
        campaignId: campaign.id,
        campaignType: campaign.type,
        userAddress: address,
        timestamp: new Date().toISOString(),
        surveyAnswers: campaign.type === "survey" ? surveyAnswers : undefined,
        quizAnswers:
          campaign.type === "quiz"
            ? {
                answers: quizAnswers,
                score: quizScore,
                totalQuestions: campaign.quizQuestions?.length || 0,
              }
            : undefined,
      };

      // TODO: Send answers to your backend API
      // await fetch('/api/campaign-responses', {
      //   method: 'POST',
      //   body: JSON.stringify(campaignResponse)
      // });

      console.log("Campaign Response Data:", campaignResponse);

      // Call the blockchain function to complete the campaign
      await completeCampaign(parseInt(campaign.id));
      setStep("complete");
      setProgress(100);
    } catch (error) {
      console.error("Failed to complete campaign:", error);
      alert(
        `Failed to complete campaign: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    } finally {
      setIsCompleting(false);
    }
  };

  const handleBackHome = () => {
    router.push("/");
  };

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <button className={styles.backButton} onClick={handleBackHome}>
          ← Back
        </button>
        <div className={styles.progressBar}>
          <Progress value={progress} variant="primary" />
        </div>
      </div>

      {/* Intro Step */}
      {step === "intro" && (
        <div className={styles.content}>
          <div className={styles.brandHeader}>
            <div className={styles.brandLogo}>{campaign.brandLogo}</div>
            <div>
              <h1 className={styles.brandName}>{campaign.brandName}</h1>
              <Badge variant="info" size="sm">
                {campaign.type}
              </Badge>
            </div>
          </div>

          <h2 className={styles.campaignTitle}>{campaign.title}</h2>
          <p className={styles.campaignDescription}>{campaign.description}</p>

          <div className={styles.infoGrid}>
            <div className={styles.infoCard}>
              <div className={styles.infoIcon}>⏱️</div>
              <div className={styles.infoLabel}>Duration</div>
              <div className={styles.infoValue}>{campaign.duration} min</div>
            </div>
            <div className={styles.infoCard}>
              <div className={styles.infoIcon}>💰</div>
              <div className={styles.infoLabel}>Reward</div>
              <div className={styles.infoValue}>
                {campaign.reward} {campaign.rewardToken || "ETH"}
              </div>
            </div>
            <div className={styles.infoCard}>
              <div className={styles.infoIcon}>📊</div>
              <div className={styles.infoLabel}>Difficulty</div>
              <div className={styles.infoValue}>{campaign.difficulty}</div>
            </div>
          </div>

          <div className={styles.tags}>
            {campaign.tags.map((tag) => (
              <span key={tag} className={styles.tag}>
                #{tag}
              </span>
            ))}
          </div>

          <div className={styles.actionSection}>
            <h3 className={styles.sectionTitle}>What you&apos;ll do:</h3>
            <ul className={styles.taskList}>
              {campaign.type === "video" && (
                <>
                  <li>Watch the complete video</li>
                  <li>Video must play until the end</li>
                  <li>Instant reward upon completion</li>
                </>
              )}
              {campaign.type === "survey" && (
                <>
                  <li>
                    Answer {campaign.surveyQuestions?.length || 0} questions
                  </li>
                  <li>Share your honest feedback</li>
                  <li>Takes about {campaign.duration} minutes</li>
                </>
              )}
              {campaign.type === "quiz" && (
                <>
                  <li>
                    Answer {campaign.quizQuestions?.length || 0} quiz questions
                  </li>
                  <li>Test your knowledge</li>
                  <li>Earn more for higher scores</li>
                </>
              )}
              {campaign.type === "share" && (
                <>
                  <li>Share on your social media</li>
                  <li>Help spread the word</li>
                  <li>Instant reward after sharing</li>
                </>
              )}
            </ul>
          </div>

          {hasAlreadyParticipated ? (
            <div className={styles.creatorNotice}>
              <div className={styles.noticeIcon}>✅</div>
              <div className={styles.noticeText}>
                <strong>You've already completed this campaign</strong>
                <br />
                Each user can only participate once per campaign. Your reward
                has already been distributed.
              </div>
            </div>
          ) : isCreator ? (
            <div className={styles.creatorNotice}>
              <div className={styles.noticeIcon}>👑</div>
              <div className={styles.noticeText}>
                <strong>You created this campaign</strong>
                <br />
                Campaign creators cannot participate in their own campaigns
              </div>
            </div>
          ) : !isConnected ? (
            <div className={styles.walletNotice}>
              <div className={styles.noticeIcon}>🔐</div>
              <div className={styles.noticeText}>
                <strong>Connect your wallet to participate</strong>
                <br />
                You need to connect your wallet to start this campaign
              </div>
              <WalletConnect />
            </div>
          ) : (
            <Button onClick={handleStart} size="lg" fullWidth>
              Start Campaign
            </Button>
          )}
        </div>
      )}

      {/* Action Step */}
      {step === "action" && (
        <div className={styles.content}>
          {/* Video Campaign */}
          {campaign.type === "video" && (
            <div className={styles.videoSection}>
              <div className={styles.videoPlayer}>
                {(campaign as any)?.videoUrl ? (
                  <div
                    style={{
                      width: "100%",
                      aspectRatio: "16/9",
                      borderRadius: "16px",
                      overflow: "hidden",
                    }}
                  >
                    {(campaign as any).videoUrl.includes("youtube.com") ||
                    (campaign as any).videoUrl.includes("youtu.be") ? (
                      <iframe
                        width="100%"
                        height="100%"
                        src={`https://www.youtube.com/embed/${
                          (campaign as any).videoUrl.includes("youtu.be")
                            ? (campaign as any).videoUrl
                                .split("youtu.be/")[1]
                                ?.split("?")[0]
                            : (campaign as any).videoUrl
                                .split("v=")[1]
                                ?.split("&")[0]
                        }?autoplay=1`}
                        title="Campaign Video"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        style={{ border: "none" }}
                      />
                    ) : (
                      <video
                        controls
                        autoPlay
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                        src={(campaign as any).videoUrl}
                      />
                    )}
                  </div>
                ) : (
                  <div className={styles.videoPlaceholder}>
                    <div className={styles.playIcon}>▶️</div>
                    <p className={styles.videoTitle}>
                      Introduction to {campaign.brandName}
                    </p>
                  </div>
                )}
              </div>
              <div className={styles.videoProgress}>
                <Progress value={videoProgress} showLabel variant="primary" />
                <p className={styles.progressText}>
                  {videoWatched ? "Video completed! ✓" : `Video is playing... `}
                </p>
              </div>
              {videoWatched && (
                <>
                  {!isConnected ? (
                    <div>
                      <div
                        style={{
                          marginBottom: "12px",
                          padding: "12px",
                          background: "#fef3c7",
                          borderRadius: "8px",
                          border: "1px solid #fde68a",
                          textAlign: "center",
                        }}
                      >
                        <p
                          style={{
                            margin: 0,
                            fontSize: "0.875rem",
                            color: "#92400e",
                          }}
                        >
                          🔐 Connect your wallet to claim rewards
                        </p>
                      </div>
                      <WalletConnect />
                    </div>
                  ) : (
                    <div>
                      <div
                        style={{
                          marginBottom: "12px",
                          padding: "12px",
                          background: "#f0f7ff",
                          borderRadius: "8px",
                          border: "1px solid #bfdbfe",
                        }}
                      >
                        <p
                          style={{
                            margin: 0,
                            fontSize: "0.75rem",
                            color: "#1e40af",
                          }}
                        >
                          <strong>Reward will be sent to:</strong>
                          <br />
                          <span style={{ fontFamily: "monospace" }}>
                            {address}
                          </span>
                        </p>
                      </div>
                      <Button
                        onClick={completeCampaignAction}
                        size="lg"
                        fullWidth
                        disabled={isCompleting || isWritePending}
                      >
                        {isCompleting || isWritePending
                          ? "Processing..."
                          : "Claim Reward"}
                      </Button>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* Survey Campaign */}
          {campaign.type === "survey" && (
            <div className={styles.surveySection}>
              {(() => {
                const questions = campaign.surveyQuestions || [];
                const currentQ = questions[currentQuestion];
                return (
                  <>
                    <div className={styles.questionCard}>
                      <div className={styles.questionNumber}>
                        Question {currentQuestion + 1} of {questions.length}
                      </div>
                      <h3 className={styles.questionText}>
                        {currentQ.question}
                      </h3>
                      <div className={styles.optionsList}>
                        {currentQ.type === "rating" ? (
                          <div className={styles.ratingOptions}>
                            {[1, 2, 3, 4, 5].map((rating) => (
                              <button
                                key={rating}
                                className={`${styles.ratingBtn} ${
                                  surveyAnswers[currentQ.id] === rating
                                    ? styles.selected
                                    : ""
                                }`}
                                onClick={() =>
                                  handleSurveyAnswer(currentQ.id, rating)
                                }
                              >
                                {rating}
                              </button>
                            ))}
                          </div>
                        ) : (
                          currentQ.options?.map((option: string) => (
                            <button
                              key={option}
                              className={`${styles.optionBtn} ${
                                surveyAnswers[currentQ.id] === option
                                  ? styles.selected
                                  : ""
                              }`}
                              onClick={() =>
                                handleSurveyAnswer(currentQ.id, option)
                              }
                            >
                              {option}
                            </button>
                          ))
                        )}
                      </div>
                    </div>
                    <Button
                      onClick={handleNextQuestion}
                      size="lg"
                      fullWidth
                      disabled={!surveyAnswers[currentQ.id]}
                    >
                      {currentQuestion === questions.length - 1
                        ? "Complete Survey"
                        : "Next Question"}
                    </Button>
                  </>
                );
              })()}
            </div>
          )}

          {/* Quiz Campaign */}
          {campaign.type === "quiz" && (
            <div className={styles.quizSection}>
              {(() => {
                const questions = campaign.quizQuestions || [];
                const currentQ = questions[currentQuizQuestion];
                return (
                  <div className={styles.questionCard}>
                    <div className={styles.questionNumber}>
                      Question {currentQuizQuestion + 1} of {questions.length}
                    </div>
                    <h3 className={styles.questionText}>{currentQ.question}</h3>
                    <div className={styles.optionsList}>
                      {currentQ.options.map((option: string, idx: number) => (
                        <button
                          key={idx}
                          className={styles.optionBtn}
                          onClick={() => handleQuizAnswer(idx)}
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })()}
            </div>
          )}

          {/* Share Campaign */}
          {campaign.type === "share" && (
            <div className={styles.shareSection}>
              <div className={styles.shareCard}>
                <div className={styles.sharePreview}>
                  <div className={styles.shareLogo}>{campaign.brandLogo}</div>
                  <h3 className={styles.shareTitle}>
                    {(campaign as any)?.shareMessage || campaign.title}
                  </h3>
                  {(campaign as any)?.sharePreviewText && (
                    <p className={styles.shareDescription}>
                      {(campaign as any).sharePreviewText}
                    </p>
                  )}
                </div>
                <div className={styles.shareButtons}>
                  <button className={styles.socialBtn} onClick={handleShare}>
                    <span className={styles.socialIcon}>🐦</span> Twitter
                  </button>
                  <button className={styles.socialBtn} onClick={handleShare}>
                    <span className={styles.socialIcon}>📘</span> Facebook
                  </button>
                  <button className={styles.socialBtn} onClick={handleShare}>
                    <span className={styles.socialIcon}>💼</span> LinkedIn
                  </button>
                </div>
                {shareClicked && (
                  <p className={styles.shareSuccess}>✓ Shared successfully!</p>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Complete Step */}
      {step === "complete" && (
        <div className={styles.content}>
          <div className={styles.successSection}>
            <div className={styles.successIcon}>🎉</div>
            <h2 className={styles.successTitle}>Congratulations!</h2>
            <p className={styles.successText}>
              You&apos;ve completed the campaign
            </p>

            <div className={styles.rewardCard}>
              <div className={styles.rewardLabel}>You earned</div>
              <div className={styles.rewardAmount}>
                {campaign.reward} {campaign.rewardToken}
              </div>
              <div
                className={styles.rewardSubtext}
                style={{
                  fontSize: "0.875rem",
                  color: "rgba(255, 255, 255, 0.85)",
                  marginTop: "8px",
                }}
              >
                ≈ ${(campaign.reward * 2500).toFixed(2)} USD
              </div>
            </div>

            {campaign.type === "quiz" &&
              (() => {
                const questions = campaign.quizQuestions || [];
                return (
                  <div className={styles.scoreCard}>
                    <p className={styles.scoreText}>
                      Your score: {quizScore} out of {questions.length}
                    </p>
                    <Progress
                      value={(quizScore / questions.length) * 100}
                      variant="success"
                      showLabel
                    />
                  </div>
                );
              })()}

            <div className={styles.completionMessage}>
              <div style={{ fontWeight: "600", marginBottom: "8px" }}>
                🎉 Reward Sent Successfully!
              </div>
              <p style={{ margin: 0 }}>
                The reward has been sent to your wallet address:
              </p>
              <p
                style={{
                  margin: "8px 0 0 0",
                  fontFamily: "monospace",
                  fontSize: "0.75rem",
                  wordBreak: "break-all",
                }}
              >
                {address}
              </p>
            </div>

            {(campaign.type === "survey" || campaign.type === "quiz") && (
              <div
                style={{
                  background: "white",
                  border: "1px solid #e5e7eb",
                  borderRadius: "12px",
                  padding: "16px",
                  marginBottom: "24px",
                }}
              >
                <p
                  style={{
                    margin: 0,
                    fontSize: "0.875rem",
                    color: "#64748b",
                  }}
                >
                  📊 Your responses have been recorded and will help improve
                  future campaigns
                </p>
              </div>
            )}

            <div className={styles.buttonGroup}>
              <Button onClick={handleBackHome} size="lg" fullWidth>
                Explore More Campaigns
              </Button>
              <div style={{ marginTop: "12px" }}>
                <button
                  onClick={() => router.push("/?tab=rewards")}
                  style={{
                    width: "100%",
                    padding: "14px 24px",
                    background: "white",
                    border: "2px solid #0052ff",
                    borderRadius: "12px",
                    color: "#0052ff",
                    fontSize: "1rem",
                    fontWeight: "600",
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "#f0f7ff";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "white";
                  }}
                >
                  View My Earnings
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function CampaignPage() {
  return <CampaignPageContent />;
}
