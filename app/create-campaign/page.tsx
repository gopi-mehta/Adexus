"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAccount } from "wagmi";
import dynamic from "next/dynamic";
import { Button } from "../components/ui/Button";
import { WalletGate } from "../components/WalletGate";
import { ContractStatus } from "../components/ContractStatus";
import { NetworkSwitcher } from "../components/NetworkSwitcher";
import { CampaignType } from "../lib/mockData";
import { useCreateCampaign } from "../lib/dataService";
import { isValidYouTubeUrl } from "../lib/youtubeUtils";
import styles from "./page.module.css";

const EMOJI_OPTIONS = [
  "🌐",
  "⚡",
  "🎨",
  "🔵",
  "💵",
  "⛓️",
  "🔄",
  "🏛️",
  "🎯",
  "💎",
  "🚀",
  "🎮",
  "📱",
  "💡",
  "🔥",
  "⭐",
  "🌟",
  "🎪",
  "🎭",
  "🎬",
  "📺",
  "📡",
  "🛸",
  "🎁",
];

interface SurveyQuestion {
  id: string;
  question: string;
  type: "single" | "multiple" | "rating";
  options?: string[];
}

interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
}

function CreateCampaignContent() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.title}>Create Campaign</h1>
          <p className={styles.subtitle}>
            Set up a new campaign to engage users and reward participation
          </p>
        </div>
        <div className={styles.loading}>
          <div className={styles.loadingSpinner}>⏳</div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return <CreateCampaignForm />;
}

// Dynamically import the form to avoid SSR issues
const CreateCampaignForm = dynamic(
  () => Promise.resolve(CreateCampaignFormComponent),
  {
    ssr: false,
    loading: () => (
      <div className={styles.loading}>
        <div className={styles.loadingSpinner}>⏳</div>
        <p>Loading...</p>
      </div>
    ),
  }
);

function CreateCampaignFormComponent() {
  const router = useRouter();
  const { address } = useAccount();
  const { createCampaign, isCreating, isCreated, error } = useCreateCampaign();
  const [currentTag, setCurrentTag] = useState("");
  const [formData, setFormData] = useState({
    brandName: "",
    brandLogo: "🌐",
    title: "",
    description: "",
    type: "video" as CampaignType,
    reward: "",
    rewardToken: "ETH",
    duration: "",
    maxParticipants: "",
    expiresAt: "",
    difficulty: "easy" as "easy" | "medium" | "hard",
    tags: [] as string[],
  });

  // Video campaign data
  const [videoUrl, setVideoUrl] = useState("");
  const [videoPreview, setVideoPreview] = useState<any>(null);
  const [watchDurationMinutes, setWatchDurationMinutes] = useState("");
  const [watchDurationSeconds, setWatchDurationSeconds] = useState("");

  // Survey campaign data
  const [surveyQuestions, setSurveyQuestions] = useState<SurveyQuestion[]>([]);
  const [currentSurveyQuestion, setCurrentSurveyQuestion] = useState("");
  const [currentSurveyType, setCurrentSurveyType] = useState<
    "single" | "multiple" | "rating"
  >("single");
  const [currentSurveyOptions, setCurrentSurveyOptions] = useState<string[]>(
    []
  );
  const [currentSurveyOption, setCurrentSurveyOption] = useState("");

  // Quiz campaign data
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [currentQuizQuestion, setCurrentQuizQuestion] = useState("");
  const [currentQuizOptions, setCurrentQuizOptions] = useState<string[]>([
    "",
    "",
    "",
    "",
  ]);
  const [currentQuizCorrectAnswer, setCurrentQuizCorrectAnswer] = useState(0);

  // Share campaign data
  const [shareMessage, setShareMessage] = useState("");
  const [sharePreviewText, setSharePreviewText] = useState("");

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle video URL changes and fetch video info
  const handleVideoUrlChange = (url: string) => {
    setVideoUrl(url);

    if (!url.trim()) {
      setVideoPreview(null);
      return;
    }

    if (!isValidYouTubeUrl(url)) {
      setVideoPreview(null);
      return;
    }

    // Extract video ID for basic preview
    const videoId = extractYouTubeVideoId(url);
    if (videoId) {
      setVideoPreview({
        videoId,
        title: "YouTube Video",
        thumbnail: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
        embedUrl: `https://www.youtube.com/embed/${videoId}`,
      });
    }
  };

  // Helper function to extract YouTube video ID
  const extractYouTubeVideoId = (url: string): string | null => {
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
      /youtube\.com\/v\/([^&\n?#]+)/,
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) {
        return match[1];
      }
    }

    return null;
  };

  const handleAddTag = () => {
    if (currentTag.trim() && !formData.tags.includes(currentTag.trim())) {
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, currentTag.trim().toLowerCase()],
      }));
      setCurrentTag("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }));
  };

  const handleAddSurveyOption = () => {
    if (currentSurveyOption.trim()) {
      setCurrentSurveyOptions([
        ...currentSurveyOptions,
        currentSurveyOption.trim(),
      ]);
      setCurrentSurveyOption("");
    }
  };

  const handleRemoveSurveyOption = (index: number) => {
    setCurrentSurveyOptions(currentSurveyOptions.filter((_, i) => i !== index));
  };

  const handleAddSurveyQuestion = () => {
    if (currentSurveyQuestion.trim()) {
      const newQuestion: SurveyQuestion = {
        id: `q${surveyQuestions.length + 1}`,
        question: currentSurveyQuestion,
        type: currentSurveyType,
        options:
          currentSurveyType !== "rating" ? currentSurveyOptions : undefined,
      };
      setSurveyQuestions([...surveyQuestions, newQuestion]);
      setCurrentSurveyQuestion("");
      setCurrentSurveyOptions([]);
      setCurrentSurveyType("single");
    }
  };

  const handleRemoveSurveyQuestion = (index: number) => {
    setSurveyQuestions(surveyQuestions.filter((_, i) => i !== index));
  };

  const handleQuizOptionChange = (index: number, value: string) => {
    const newOptions = [...currentQuizOptions];
    newOptions[index] = value;
    setCurrentQuizOptions(newOptions);
  };

  const handleAddQuizQuestion = () => {
    if (
      currentQuizQuestion.trim() &&
      currentQuizOptions.every((opt) => opt.trim())
    ) {
      const newQuestion: QuizQuestion = {
        id: `q${quizQuestions.length + 1}`,
        question: currentQuizQuestion,
        options: currentQuizOptions,
        correctAnswer: currentQuizCorrectAnswer,
      };
      setQuizQuestions([...quizQuestions, newQuestion]);
      setCurrentQuizQuestion("");
      setCurrentQuizOptions(["", "", "", ""]);
      setCurrentQuizCorrectAnswer(0);
    }
  };

  const handleRemoveQuizQuestion = (index: number) => {
    setQuizQuestions(quizQuestions.filter((_, i) => i !== index));
  };

  // Calculate funding requirements
  const calculateFunding = () => {
    const reward = parseFloat(formData.reward) || 0;
    const maxParticipants = parseInt(formData.maxParticipants) || 0;

    if (reward > 0 && maxParticipants > 0) {
      const totalRewardsNeeded = maxParticipants * reward;
      const platformFeePercentage = 2.5; // 2.5% platform fee
      const platformFee = (totalRewardsNeeded * platformFeePercentage) / 100;
      const totalFunding = totalRewardsNeeded + platformFee;

      return {
        totalRewardsNeeded,
        platformFee,
        totalFunding,
        platformFeePercentage,
      };
    }

    return null;
  };

  const fundingDetails = calculateFunding();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate brand information
    if (!formData.brandName.trim()) {
      alert("Please enter a brand name");
      return;
    }
    if (!formData.brandLogo.trim()) {
      alert("Please select a brand logo");
      return;
    }

    // Validate type-specific requirements
    if (formData.type === "video" && !videoUrl.trim()) {
      alert("Please add a video URL for video campaigns");
      return;
    }
    if (
      formData.type === "video" &&
      (!watchDurationMinutes.trim() || !watchDurationSeconds.trim())
    ) {
      alert("Please specify the exact watch duration for video campaigns");
      return;
    }
    if (formData.type === "survey" && surveyQuestions.length === 0) {
      alert("Please add at least one survey question");
      return;
    }
    if (formData.type === "quiz" && quizQuestions.length === 0) {
      alert("Please add at least one quiz question");
      return;
    }
    if (formData.type === "share" && !shareMessage.trim()) {
      alert("Please add a share message");
      return;
    }

    try {
      console.log("Creating campaign on blockchain...");

      // Create campaign on blockchain - this should trigger wallet signature
      const txHash = await createCampaign({
        title: formData.title,
        description: formData.description,
        type: formData.type,
        reward: parseFloat(formData.reward),
        maxParticipants: parseInt(formData.maxParticipants),
        expiresAt: formData.expiresAt,
        duration: formData.duration,
        difficulty: formData.difficulty,
        tags: formData.tags.join(", "),
        brandName: formData.brandName,
        brandLogo: formData.brandLogo,
        // Type-specific data
        videoUrl: formData.type === "video" ? videoUrl : undefined,
        videoDuration:
          formData.type === "video"
            ? parseInt(watchDurationMinutes) * 60 +
              parseInt(watchDurationSeconds)
            : undefined,
        surveyQuestions:
          formData.type === "survey" ? surveyQuestions : undefined,
        quizQuestions: formData.type === "quiz" ? quizQuestions : undefined,
        shareMessage: formData.type === "share" ? shareMessage : undefined,
        sharePreviewText:
          formData.type === "share" ? sharePreviewText : undefined,
      });

      console.log("Campaign created on blockchain with hash:", txHash);

      // Campaign created successfully on blockchain
      // No localStorage needed - data is now on-chain

      // Navigate to manage campaigns
      router.push("/manage-campaigns");
    } catch (err: any) {
      console.error("Failed to create campaign:", err);
      alert(`Failed to create campaign: ${err.message || "Please try again."}`);
    }
  };

  return (
    <WalletGate message="Connect your wallet to create campaigns and fund rewards">
      <div className={styles.container}>
        <div className={styles.header}>
          <button className={styles.backButton} onClick={() => router.back()}>
            ← Back
          </button>
          <div className={styles.headerContent}>
            <img
              src="/Adexus logo.png"
              alt="Adexus Logo"
              className={styles.appLogo}
            />
            <div>
              <h1 className={styles.title}>Create Campaign</h1>
              <p className={styles.subtitle}>
                Set up a new campaign to engage users and reward participation
              </p>
            </div>
          </div>
          <div
            style={{
              marginTop: "12px",
              padding: "12px",
              background: "#f0f7ff",
              borderRadius: "8px",
              border: "1px solid #bfdbfe",
            }}
          >
            <div style={{ fontSize: "0.75rem", color: "#1e40af" }}>
              <strong>Creator Address:</strong>
              <br />
              <span style={{ fontFamily: "monospace" }}>{address}</span>
            </div>
          </div>

          {/* Network Switcher */}
          <div style={{ marginTop: "16px" }}>
            <NetworkSwitcher />
          </div>

          {/* Contract Status */}
          <div style={{ marginTop: "16px" }}>
            <ContractStatus />
          </div>
        </div>

        <form className={styles.form} onSubmit={handleSubmit}>
          {/* Brand Information */}
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>Brand Information</h2>

            <div className={styles.formGroup}>
              <label className={styles.label}>
                Brand Name<span className={styles.required}>*</span>
              </label>
              <input
                type="text"
                name="brandName"
                className={styles.input}
                value={formData.brandName}
                onChange={handleInputChange}
                placeholder="e.g., CryptoVerse"
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>
                Brand Logo (Emoji)<span className={styles.required}>*</span>
              </label>
              <div className={styles.emojiPicker}>
                {EMOJI_OPTIONS.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    className={`${styles.emojiButton} ${
                      formData.brandLogo === emoji ? styles.selected : ""
                    }`}
                    onClick={() =>
                      setFormData((prev) => ({ ...prev, brandLogo: emoji }))
                    }
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Campaign Details */}
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>Campaign Details</h2>

            <div className={styles.formGroup}>
              <label className={styles.label}>
                Campaign Title<span className={styles.required}>*</span>
              </label>
              <input
                type="text"
                name="title"
                className={styles.input}
                value={formData.title}
                onChange={handleInputChange}
                placeholder="e.g., Watch: Introduction to Web3 Gaming"
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>
                Description<span className={styles.required}>*</span>
              </label>
              <textarea
                name="description"
                className={styles.textarea}
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Describe what participants will do and what they'll learn..."
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>
                Campaign Type<span className={styles.required}>*</span>
              </label>
              <div className={styles.radioGroup}>
                {[
                  {
                    value: "video",
                    label: "Video",
                    description: "Users watch a video",
                  },
                  {
                    value: "survey",
                    label: "Survey",
                    description: "Users answer questions",
                  },
                  {
                    value: "quiz",
                    label: "Quiz",
                    description: "Users test their knowledge",
                  },
                  {
                    value: "share",
                    label: "Share",
                    description: "Users share on social media",
                  },
                ].map((option) => (
                  <div
                    key={option.value}
                    className={`${styles.radioOption} ${
                      formData.type === option.value ? styles.selected : ""
                    }`}
                    onClick={() =>
                      setFormData((prev) => ({
                        ...prev,
                        type: option.value as CampaignType,
                      }))
                    }
                  >
                    <input
                      type="radio"
                      name="type"
                      value={option.value}
                      checked={formData.type === option.value}
                      onChange={handleInputChange}
                    />
                    <div>
                      <div className={styles.radioLabel}>{option.label}</div>
                      <div className={styles.radioDescription}>
                        {option.description}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className={styles.grid}>
              <div className={styles.formGroup}>
                <label className={styles.label}>
                  Duration (minutes)<span className={styles.required}>*</span>
                </label>
                <input
                  type="number"
                  name="duration"
                  className={styles.input}
                  value={formData.duration}
                  onChange={handleInputChange}
                  placeholder="5"
                  min="1"
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>
                  Difficulty<span className={styles.required}>*</span>
                </label>
                <select
                  name="difficulty"
                  className={styles.select}
                  value={formData.difficulty}
                  onChange={handleInputChange}
                  required
                >
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>
            </div>
          </div>

          {/* Rewards & Limits */}
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>Rewards & Limits</h2>

            <div className={styles.grid}>
              <div className={styles.formGroup}>
                <label className={styles.label}>
                  Reward Amount<span className={styles.required}>*</span>
                </label>
                <input
                  type="number"
                  name="reward"
                  className={styles.input}
                  value={formData.reward}
                  onChange={handleInputChange}
                  placeholder="0.001"
                  step="0.001"
                  min="0.001"
                  required
                />
                <div className={styles.hint}>Amount in ETH equivalent</div>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>
                  Reward Token<span className={styles.required}>*</span>
                </label>
                <select
                  name="rewardToken"
                  className={styles.select}
                  value="ETH"
                  disabled
                  required
                >
                  <option value="ETH">ETH</option>
                </select>
              </div>
            </div>

            <div className={styles.grid}>
              <div className={styles.formGroup}>
                <label className={styles.label}>
                  Max Participants<span className={styles.required}>*</span>
                </label>
                <input
                  type="number"
                  name="maxParticipants"
                  className={styles.input}
                  value={formData.maxParticipants}
                  onChange={handleInputChange}
                  placeholder="1000"
                  min="1"
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>
                  Expires At<span className={styles.required}>*</span>
                </label>
                <input
                  type="date"
                  name="expiresAt"
                  className={styles.input}
                  value={formData.expiresAt}
                  onChange={handleInputChange}
                  min={new Date().toISOString().split("T")[0]}
                  required
                />
              </div>
            </div>
          </div>

          {/* Campaign Type Specific Content */}
          {formData.type === "video" && (
            <div className={styles.section}>
              <h2 className={styles.sectionTitle}>Video Content</h2>

              <div className={styles.formGroup}>
                <label className={styles.label}>
                  Video URL<span className={styles.required}>*</span>
                </label>
                <input
                  type="url"
                  className={styles.input}
                  value={videoUrl}
                  onChange={(e) => handleVideoUrlChange(e.target.value)}
                  placeholder="https://www.youtube.com/watch?v=..."
                  required
                />
                <div className={styles.hint}>
                  YouTube URL that users will watch
                </div>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>
                  Watch Duration<span className={styles.required}>*</span>
                </label>
                <div className={styles.durationInputs}>
                  <div className={styles.durationField}>
                    <input
                      type="number"
                      className={styles.input}
                      value={watchDurationMinutes}
                      onChange={(e) => setWatchDurationMinutes(e.target.value)}
                      placeholder="0"
                      min="0"
                      max="59"
                      required
                    />
                    <span className={styles.durationLabel}>minutes</span>
                  </div>
                  <div className={styles.durationField}>
                    <input
                      type="number"
                      className={styles.input}
                      value={watchDurationSeconds}
                      onChange={(e) => setWatchDurationSeconds(e.target.value)}
                      placeholder="0"
                      min="0"
                      max="59"
                      required
                    />
                    <span className={styles.durationLabel}>seconds</span>
                  </div>
                </div>
                <div className={styles.hint}>
                  Exact time users must watch to earn the reward
                </div>
              </div>

              {videoPreview && (
                <div className={styles.previewCard}>
                  <div className={styles.previewTitle}>Video Preview</div>
                  <div className={styles.videoPreview}>
                    <iframe
                      width="100%"
                      height="315"
                      src={videoPreview.embedUrl}
                      title={videoPreview.title}
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      style={{ borderRadius: "8px" }}
                    />
                  </div>
                  <div className={styles.videoInfo}>
                    <h4 className={styles.videoTitle}>{videoPreview.title}</h4>
                    <div className={styles.videoMeta}>
                      <span>
                        Watch Duration: {watchDurationMinutes || "0"}m{" "}
                        {watchDurationSeconds || "0"}s
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {videoUrl && !videoPreview && (
                <div className={styles.errorCard}>
                  <div className={styles.errorIcon}>⚠️</div>
                  <div className={styles.errorText}>
                    Please enter a valid YouTube URL
                  </div>
                </div>
              )}
            </div>
          )}

          {formData.type === "survey" && (
            <div className={styles.section}>
              <h2 className={styles.sectionTitle}>Survey Questions</h2>

              <div className={styles.formGroup}>
                <label className={styles.label}>Question Text</label>
                <input
                  type="text"
                  className={styles.input}
                  value={currentSurveyQuestion}
                  onChange={(e) => setCurrentSurveyQuestion(e.target.value)}
                  placeholder="e.g., How often do you use our product?"
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Question Type</label>
                <div className={styles.radioGroup}>
                  {[
                    {
                      value: "single",
                      label: "Single Choice",
                      description: "Select one option",
                    },
                    {
                      value: "multiple",
                      label: "Multiple Choice",
                      description: "Select multiple options",
                    },
                    {
                      value: "rating",
                      label: "Rating",
                      description: "Rate from 1-5",
                    },
                  ].map((option) => (
                    <div
                      key={option.value}
                      className={`${styles.radioOption} ${
                        currentSurveyType === option.value
                          ? styles.selected
                          : ""
                      }`}
                      onClick={() => setCurrentSurveyType(option.value as any)}
                    >
                      <input
                        type="radio"
                        name="surveyType"
                        value={option.value}
                        checked={currentSurveyType === option.value}
                        onChange={(e) =>
                          setCurrentSurveyType(e.target.value as any)
                        }
                      />
                      <div>
                        <div className={styles.radioLabel}>{option.label}</div>
                        <div className={styles.radioDescription}>
                          {option.description}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {currentSurveyType !== "rating" && (
                <div className={styles.formGroup}>
                  <label className={styles.label}>Answer Options</label>
                  <div className={styles.tagInput}>
                    <input
                      type="text"
                      className={`${styles.input} ${styles.tagInputField}`}
                      value={currentSurveyOption}
                      onChange={(e) => setCurrentSurveyOption(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleAddSurveyOption();
                        }
                      }}
                      placeholder="e.g., Daily, Weekly, Monthly"
                    />
                    <button
                      type="button"
                      className={styles.addTagButton}
                      onClick={handleAddSurveyOption}
                    >
                      Add
                    </button>
                  </div>
                  {currentSurveyOptions.length > 0 && (
                    <div className={styles.tags}>
                      {currentSurveyOptions.map((option, idx) => (
                        <span key={idx} className={styles.tag}>
                          {option}
                          <button
                            type="button"
                            className={styles.removeTag}
                            onClick={() => handleRemoveSurveyOption(idx)}
                          >
                            ✕
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <Button
                type="button"
                onClick={handleAddSurveyQuestion}
                size="md"
                variant="outline"
                disabled={
                  !currentSurveyQuestion.trim() ||
                  (currentSurveyType !== "rating" &&
                    currentSurveyOptions.length === 0)
                }
              >
                + Add Question
              </Button>

              {surveyQuestions.length > 0 && (
                <div style={{ marginTop: "20px" }}>
                  <div className={styles.previewTitle}>
                    Questions ({surveyQuestions.length})
                  </div>
                  {surveyQuestions.map((q, idx) => (
                    <div
                      key={q.id}
                      className={styles.previewCard}
                      style={{ marginTop: "12px" }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "start",
                        }}
                      >
                        <div style={{ flex: 1 }}>
                          <div
                            style={{ fontWeight: "600", marginBottom: "8px" }}
                          >
                            {idx + 1}. {q.question}
                          </div>
                          <div
                            style={{ fontSize: "0.75rem", color: "#64748b" }}
                          >
                            Type:{" "}
                            {q.type === "rating"
                              ? "Rating (1-5)"
                              : q.type === "single"
                              ? "Single Choice"
                              : "Multiple Choice"}
                          </div>
                          {q.options && (
                            <div
                              style={{ marginTop: "8px", fontSize: "0.875rem" }}
                            >
                              {q.options.map((opt, i) => (
                                <div key={i} style={{ color: "#64748b" }}>
                                  • {opt}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                        <button
                          type="button"
                          className={styles.removeTag}
                          onClick={() => handleRemoveSurveyQuestion(idx)}
                          style={{ fontSize: "1.25rem", color: "#ef4444" }}
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {formData.type === "quiz" && (
            <div className={styles.section}>
              <h2 className={styles.sectionTitle}>Quiz Questions</h2>

              <div className={styles.formGroup}>
                <label className={styles.label}>Question</label>
                <input
                  type="text"
                  className={styles.input}
                  value={currentQuizQuestion}
                  onChange={(e) => setCurrentQuizQuestion(e.target.value)}
                  placeholder="e.g., What is the capital of France?"
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>
                  Answer Options (4 required)
                </label>
                {currentQuizOptions.map((option, idx) => (
                  <div key={idx} style={{ marginBottom: "12px" }}>
                    <div
                      style={{
                        display: "flex",
                        gap: "8px",
                        alignItems: "center",
                      }}
                    >
                      <input
                        type="radio"
                        name="correctAnswer"
                        checked={currentQuizCorrectAnswer === idx}
                        onChange={() => setCurrentQuizCorrectAnswer(idx)}
                        style={{ flexShrink: 0 }}
                      />
                      <input
                        type="text"
                        className={styles.input}
                        value={option}
                        onChange={(e) =>
                          handleQuizOptionChange(idx, e.target.value)
                        }
                        placeholder={`Option ${idx + 1}`}
                        style={{ margin: 0 }}
                      />
                    </div>
                    {idx === currentQuizCorrectAnswer && (
                      <div
                        className={styles.hint}
                        style={{ marginLeft: "28px" }}
                      >
                        ✓ Correct answer
                      </div>
                    )}
                  </div>
                ))}
                <div className={styles.hint}>
                  Select the radio button next to the correct answer
                </div>
              </div>

              <Button
                type="button"
                onClick={handleAddQuizQuestion}
                size="md"
                variant="outline"
                disabled={
                  !currentQuizQuestion.trim() ||
                  !currentQuizOptions.every((opt) => opt.trim())
                }
              >
                + Add Question
              </Button>

              {quizQuestions.length > 0 && (
                <div style={{ marginTop: "20px" }}>
                  <div className={styles.previewTitle}>
                    Questions ({quizQuestions.length})
                  </div>
                  {quizQuestions.map((q, idx) => (
                    <div
                      key={q.id}
                      className={styles.previewCard}
                      style={{ marginTop: "12px" }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "start",
                        }}
                      >
                        <div style={{ flex: 1 }}>
                          <div
                            style={{ fontWeight: "600", marginBottom: "8px" }}
                          >
                            {idx + 1}. {q.question}
                          </div>
                          <div style={{ fontSize: "0.875rem" }}>
                            {q.options.map((opt, i) => (
                              <div
                                key={i}
                                style={{
                                  color:
                                    i === q.correctAnswer
                                      ? "#10b981"
                                      : "#64748b",
                                  fontWeight:
                                    i === q.correctAnswer ? "600" : "normal",
                                }}
                              >
                                {i === q.correctAnswer ? "✓ " : "  "}
                                {opt}
                              </div>
                            ))}
                          </div>
                        </div>
                        <button
                          type="button"
                          className={styles.removeTag}
                          onClick={() => handleRemoveQuizQuestion(idx)}
                          style={{ fontSize: "1.25rem", color: "#ef4444" }}
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {formData.type === "share" && (
            <div className={styles.section}>
              <h2 className={styles.sectionTitle}>Share Content</h2>

              <div className={styles.formGroup}>
                <label className={styles.label}>
                  Share Message<span className={styles.required}>*</span>
                </label>
                <textarea
                  className={styles.textarea}
                  value={shareMessage}
                  onChange={(e) => setShareMessage(e.target.value)}
                  placeholder="e.g., Check out this amazing new platform! 🚀"
                  required
                />
                <div className={styles.hint}>
                  The message users will share on social media
                </div>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Preview Text (Optional)</label>
                <input
                  type="text"
                  className={styles.input}
                  value={sharePreviewText}
                  onChange={(e) => setSharePreviewText(e.target.value)}
                  placeholder="Additional context or call-to-action"
                />
              </div>

              {shareMessage && (
                <div className={styles.previewCard}>
                  <div className={styles.previewTitle}>Share Preview</div>
                  <div
                    style={{
                      background: "white",
                      padding: "16px",
                      borderRadius: "8px",
                      border: "1px solid #e5e7eb",
                    }}
                  >
                    <div style={{ fontSize: "0.875rem", marginBottom: "8px" }}>
                      {shareMessage}
                    </div>
                    {sharePreviewText && (
                      <div style={{ fontSize: "0.75rem", color: "#64748b" }}>
                        {sharePreviewText}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Tags */}
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>Tags</h2>

            <div className={styles.formGroup}>
              <label className={styles.label}>Add Tags</label>
              <div className={styles.tagInput}>
                <input
                  type="text"
                  className={`${styles.input} ${styles.tagInputField}`}
                  value={currentTag}
                  onChange={(e) => setCurrentTag(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddTag();
                    }
                  }}
                  placeholder="e.g., gaming, web3, defi"
                />
                <button
                  type="button"
                  className={styles.addTagButton}
                  onClick={handleAddTag}
                >
                  Add
                </button>
              </div>
              <div className={styles.hint}>
                Press Enter or click Add to add tags
              </div>
            </div>

            {formData.tags.length > 0 && (
              <div className={styles.tags}>
                {formData.tags.map((tag) => (
                  <span key={tag} className={styles.tag}>
                    #{tag}
                    <button
                      type="button"
                      className={styles.removeTag}
                      onClick={() => handleRemoveTag(tag)}
                    >
                      ✕
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Funding Calculation */}
          {fundingDetails && (
            <div className={styles.fundingSection}>
              <h3 className={styles.fundingTitle}>
                💰 Campaign Funding Requirements
              </h3>
              <div className={styles.fundingDetails}>
                <div className={styles.fundingRow}>
                  <span>Total Rewards Needed:</span>
                  <span className={styles.fundingAmount}>
                    {fundingDetails.totalRewardsNeeded.toFixed(4)} ETH
                  </span>
                </div>
                <div className={styles.fundingRow}>
                  <span>
                    Platform Fee ({fundingDetails.platformFeePercentage}%):
                  </span>
                  <span className={styles.fundingAmount}>
                    {fundingDetails.platformFee.toFixed(4)} ETH
                  </span>
                </div>
                <div className={styles.fundingRowTotal}>
                  <span>Total Initial Funding Required:</span>
                  <span className={styles.fundingTotal}>
                    {fundingDetails.totalFunding.toFixed(4)} ETH
                  </span>
                </div>
              </div>
              <div className={styles.fundingNote}>
                💡 This amount will be deposited when you create the campaign
                and used to pay rewards to participants.
              </div>
            </div>
          )}

          {/* Submit */}
          <div className={styles.buttonGroup}>
            <Button
              type="button"
              variant="secondary"
              size="lg"
              onClick={() => router.back()}
            >
              Cancel
            </Button>
            <Button type="submit" size="lg" fullWidth disabled={isCreating}>
              {isCreating ? "Creating Campaign..." : "Create Campaign"}
            </Button>
          </div>

          {error && (
            <div
              style={{
                marginTop: "16px",
                padding: "12px",
                background: "#fef2f2",
                borderRadius: "8px",
                border: "1px solid #fecaca",
                color: "#dc2626",
                fontSize: "0.875rem",
              }}
            >
              Error: {error.message || "Failed to create campaign"}
            </div>
          )}

          {isCreated && (
            <div
              style={{
                marginTop: "16px",
                padding: "12px",
                background: "#f0fdf4",
                borderRadius: "8px",
                border: "1px solid #bbf7d0",
                color: "#166534",
                fontSize: "0.875rem",
              }}
            >
              ✅ Campaign created successfully! Redirecting...
            </div>
          )}
        </form>
      </div>
    </WalletGate>
  );
}

// Disable SSR for this page to avoid WagmiProvider issues
const CreateCampaign = dynamic(() => Promise.resolve(CreateCampaignContent), {
  ssr: false,
  loading: () => (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Create Campaign</h1>
        <p className={styles.subtitle}>
          Set up a new campaign to engage users and reward participation
        </p>
      </div>
      <div className={styles.loading}>
        <div className={styles.loadingSpinner}>⏳</div>
        <p>Loading...</p>
      </div>
    </div>
  ),
});

export default CreateCampaign;
