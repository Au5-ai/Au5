export const landingCaptions = {
  heroSection: {
    title: {
      part1: "Turn your",
      meetings: "meetings",
      part2: "into insights",
    },
    description:
      "Get accurate transcripts, AI-powered summaries, and actionable insights from every meeting. Works with Zoom, Teams, Google Meet, and more.",
    downloadButton: "Download Chrome Extension",
    features: {
      noCreditCard: "No credit card required",
      alwaysFree: "Always free",
    },
    imageAlt: "Au5.ai meeting insights dashboard",
  },
  navigation: {
    signup: "Sign Up",
    login: "Log In",
  },
} as const;

// For backward compatibility
export const heroSectionCaptions = landingCaptions.heroSection;
