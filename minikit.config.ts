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
    header:
      "eyJmaWQiOjIyNzczMCwidHlwZSI6ImN1c3RvZHkiLCJrZXkiOiIweDliNUUzN0UzNTBGNjZBMkYzNGU4NUMzOEQwYTM3NDc4ZDQxYWYzOUIifQ",
    payload: "eyJkb21haW4iOiJiYXNlLWF1dGgtb3JjaW4udmVyY2VsLmFwcCJ9",
    signature:
      "MHg3NDg0YmIyZjVlMTdjYjI3NzAzOGI1YzZjOTQwOGZlMmZjZWIwNDRiNDJkMTIwNGNjYzBmZjc3MzUzYTFiNjI4NTFjZTRlODNjZTk0NDEyYjExNDdjNjUxZDc1ZTA4NzA0MjlkNjFhNDFkMTRlNzdkNWVkZTRiNDg1YWY1ZTM5ZDFj",
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
    // Open Graph metadata for Farcaster preview
    ogTitle: "Adexus - Earn Crypto for Brand Engagement",
    ogDescription:
      "Complete brand campaigns and earn instant crypto rewards. No data sharing required.",
    ogImageUrl: `${ROOT_URL}/Adexus_horizontal.png`, // ensure this image is 1200x630 px recommended
  },
  baseBuilder: {
    ownerAddress: "0xcc30b50D97ef2993201161945Eda9D4912d8dE55",
  },
} as const;
