"use client";

// IPFS service for uploading and fetching campaign metadata
export interface CampaignMetadata {
  title: string;
  description: string;
  type: "video" | "survey" | "share" | "quiz";
  brandName: string;
  brandLogo: string;
  duration: number;
  difficulty: "easy" | "medium" | "hard";
  tags: string[];
  // Type-specific data
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

// IPFS Gateways (in priority order)
const IPFS_GATEWAYS = [
  "https://gateway.pinata.cloud/ipfs/",
  "https://ipfs.io/ipfs/",
  "https://cloudflare-ipfs.com/ipfs/",
  "https://dweb.link/ipfs/",
];

// Production IPFS service using Pinata
// Always fetches fresh data from IPFS (no local caching)
class IPFSService {
  private pinataJWT = process.env.NEXT_PUBLIC_PINATA_JWT;
  private ipfsGateway =
    process.env.NEXT_PUBLIC_IPFS_GATEWAY || IPFS_GATEWAYS[0];
  private gateways = IPFS_GATEWAYS;
  private usePinata = typeof window !== "undefined" && !!this.pinataJWT;
  private maxRetries = 3;
  private retryDelay = 1000; // ms

  constructor() {
    // No initialization needed - pure IPFS service
  }

  // Helper function for retry logic
  private async retryOperation<T>(
    operation: () => Promise<T>,
    maxRetries: number = this.maxRetries,
    delay: number = this.retryDelay
  ): Promise<T> {
    let lastError: Error | null = null;

    for (let i = 0; i < maxRetries; i++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error as Error;
        console.warn(`Attempt ${i + 1}/${maxRetries} failed:`, error);

        if (i < maxRetries - 1) {
          await new Promise((resolve) => setTimeout(resolve, delay * (i + 1)));
        }
      }
    }

    throw lastError || new Error("Operation failed after retries");
  }

  // Upload metadata to Pinata (production) with retry logic
  private async uploadToPinata(metadata: CampaignMetadata): Promise<string> {
    if (!this.pinataJWT) {
      throw new Error("Pinata JWT not configured");
    }

    return await this.retryOperation(async () => {
      const response = await fetch(
        "https://api.pinata.cloud/pinning/pinJSONToIPFS",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${this.pinataJWT}`,
          },
          body: JSON.stringify({
            pinataContent: metadata,
            pinataMetadata: {
              name: `campaign-${metadata.title}`,
            },
          }),
        }
      );

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Failed to upload to Pinata: ${error}`);
      }

      const data = await response.json();
      console.log("✅ Successfully uploaded to Pinata:", data.IpfsHash);

      return `ipfs://${data.IpfsHash}`;
    });
  }

  // Upload metadata to IPFS (requires Pinata configuration)
  async uploadMetadata(metadata: CampaignMetadata): Promise<string> {
    if (!this.usePinata) {
      throw new Error(
        "Pinata not configured. Please set NEXT_PUBLIC_PINATA_JWT in your environment variables."
      );
    }

    try {
      console.log("Uploading to Pinata IPFS...");
      return await this.uploadToPinata(metadata);
    } catch (error) {
      console.error("Failed to upload to Pinata:", error);
      throw new Error(
        `Failed to upload metadata to IPFS: ${(error as Error).message}`
      );
    }
  }

  // Fetch from a specific gateway
  private async fetchFromGateway(
    gateway: string,
    hash: string
  ): Promise<CampaignMetadata> {
    const url = `${gateway}${hash}`;
    console.log(`Trying gateway: ${url}`);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

    try {
      const response = await fetch(url, {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const metadata = await response.json();
      return metadata;
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  }

  // Fetch metadata from IPFS with multiple gateway fallback
  async fetchMetadata(ipfsUri: string): Promise<CampaignMetadata | null> {
    try {
      // Extract hash from IPFS URI
      const hash = ipfsUri.replace("ipfs://", "");

      // Validate hash
      if (!hash || hash.length < 10) {
        console.error("Invalid IPFS hash:", hash);
        return null;
      }

      // Fetch from IPFS gateways with fallback
      console.log("📡 Fetching metadata from IPFS:", hash);

      // Try each gateway in order
      for (const gateway of this.gateways) {
        try {
          const metadata = await this.fetchFromGateway(gateway, hash);
          console.log(`✅ Successfully fetched from ${gateway}`);
          return metadata;
        } catch (error) {
          console.warn(`Gateway ${gateway} failed:`, error);
          // Continue to next gateway
        }
      }

      throw new Error("All IPFS gateways failed");
    } catch (error) {
      console.error("❌ Failed to fetch metadata from IPFS:", error);
      return null;
    }
  }

  // Check if URI is a valid IPFS URI
  isValidIPFSUri(uri: string): boolean {
    return uri.startsWith("ipfs://") && uri.length > 10;
  }

  // Test Pinata connection
  async testPinataConnection(): Promise<{
    success: boolean;
    message: string;
  }> {
    if (!this.pinataJWT) {
      return {
        success: false,
        message: "Pinata JWT not configured",
      };
    }

    try {
      // Test by uploading a small test object
      const testMetadata = {
        title: "Connection Test",
        description: "Testing Pinata connection",
        type: "video" as const,
        brandName: "Test",
        brandLogo: "🧪",
        duration: 1,
        difficulty: "easy" as const,
        tags: ["test"],
      };

      const response = await fetch(
        "https://api.pinata.cloud/pinning/pinJSONToIPFS",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${this.pinataJWT}`,
          },
          body: JSON.stringify({
            pinataContent: testMetadata,
            pinataMetadata: {
              name: "connection-test",
            },
          }),
        }
      );

      if (!response.ok) {
        const error = await response.text();
        return {
          success: false,
          message: `Pinata API error: ${error}`,
        };
      }

      const data = await response.json();
      console.log("✅ Pinata connection test successful:", data.IpfsHash);

      return {
        success: true,
        message: `Connected successfully. Test CID: ${data.IpfsHash}`,
      };
    } catch (error) {
      return {
        success: false,
        message: `Connection failed: ${(error as Error).message}`,
      };
    }
  }

  // Get service status
  getStatus(): {
    mode: "production" | "unconfigured";
    configured: boolean;
    gateways: string[];
  } {
    return {
      mode: this.usePinata ? "production" : "unconfigured",
      configured: !!this.pinataJWT,
      gateways: this.gateways,
    };
  }
}

export const ipfsService = new IPFSService();

// Helper function to create metadata from campaign form data
export function createCampaignMetadata(formData: {
  title: string;
  description: string;
  type: "video" | "survey" | "share" | "quiz";
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
}): CampaignMetadata {
  return {
    title: formData.title,
    description: formData.description,
    type: formData.type,
    brandName: formData.brandName,
    brandLogo: formData.brandLogo,
    duration: parseInt(formData.duration),
    difficulty: formData.difficulty,
    tags: formData.tags
      .split(",")
      .map((tag) => tag.trim())
      .filter((tag) => tag.length > 0),
    videoUrl: formData.videoUrl,
    surveyQuestions: formData.surveyQuestions,
    quizQuestions: formData.quizQuestions,
    shareMessage: formData.shareMessage,
    sharePreviewText: formData.sharePreviewText,
  };
}
