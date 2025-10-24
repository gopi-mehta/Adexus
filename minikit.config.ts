const ROOT_URL =
  process.env.NEXT_PUBLIC_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "http://localhost:3000");

/**
 * MiniApp configuration object. Must follow the Farcaster MiniApp specification.
 *
 * @see {@link https://miniapps.farcaster.xyz/docs/guides/publishing}
 */
export const minikitConfig = {
  accountAssociation: {
    header: "",
    payload: "",
    signature: "",
  },
  miniapp: {
    version: "1",
    name: "Adexus",
    subtitle: "Earn Crypto for Your Engagement",
    description:
      "Complete brand campaigns and earn instant crypto rewards. No data sharing required.",
    screenshotUrls: [`${ROOT_URL}/Adexus_horizontal.png`],
    iconUrl: `${ROOT_URL}/Adexus logo.png`,
    splashImageUrl: `${ROOT_URL}/Adexus_horizontal.png`,
    splashBackgroundColor: "#0052FF",
    homeUrl: ROOT_URL,
    webhookUrl: `${ROOT_URL}/api/webhook`,
    primaryCategory: "social",
    tags: ["rewards", "crypto", "campaigns", "engagement", "earn"],
    heroImageUrl: `${ROOT_URL}/Adexus_horizontal.png`,
    tagline: "Earn crypto rewards for your engagement",
    ogTitle: "Adexus - Earn Crypto for Brand Engagement",
    ogDescription:
      "Complete brand campaigns and earn instant crypto rewards. No data sharing required.",
    ogImageUrl: `${ROOT_URL}/Adexus_horizontal.png`,
  },
} as const;
