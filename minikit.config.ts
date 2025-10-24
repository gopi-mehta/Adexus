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
      "eyJmaWQiOjQwMDc0MCwidHlwZSI6ImN1c3RvZHkiLCJrZXkiOiIweGZjRUYxQUNEQWNmM0FCM2RBQkU2MTQ2NTlBOWI5N2FmOWY4NTJiNDcifQ",
    payload: "eyJkb21haW4iOiJhZGV4dXMudmVyY2VsLmFwcCJ9",
    signature:
      "Fk+g/7oHk4fzTO01aEsFA586PO1CHc+0Ft8W6z3wtnFKYjmky2Os1fOlZUjBA+oyQeM62XSVrsJDtQMrGAetyxs=",
  },
  miniapp: {
    version: "1",
    name: "Adexus",
    subtitle: "Rewards for your engagement",
    description:
      "Complete brand campaigns and earn instant crypto rewards. No data sharing required.",
    screenshotUrls: [`${ROOT_URL}/Adexus.png`],
    iconUrl: `${ROOT_URL}/Adexus.png`,
    splashImageUrl: `${ROOT_URL}/Adexus.png`,
    splashBackgroundColor: "#000000",
    homeUrl: ROOT_URL,
    webhookUrl: `${ROOT_URL}/api/webhook`,
    primaryCategory: "social",
    tags: ["rewards", "crypto", "campaigns", "engagement", "earn"],
    heroImageUrl: `${ROOT_URL}/Adexus_horizontal.png`,
    tagline: "Rewards for your engagement",
    // Open Graph metadata for Farcaster preview
    ogTitle: "Adexus",
    ogDescription:
      "Complete brand campaigns and earn instant crypto rewards. No data sharing required.",
    ogImageUrl: `${ROOT_URL}/Adexus.png`, // ensure this image is 1200x630 px recommended
  },
  baseBuilder: {
    ownerAddress: "0xcc30b50D97ef2993201161945Eda9D4912d8dE55",
  },
} as const;
