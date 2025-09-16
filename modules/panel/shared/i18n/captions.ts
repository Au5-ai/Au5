export const globalCaptions = {
  back: "Back",
  next: "Next",
  brandName: "Au5.ai",
  playground: "playground",
  emptyState: {
    search: {
      noResults: {
        title: "No results found",
        description:
          "We couldn't find anything matching. Try adjusting your search terms.",
        action: "Clear Search",
      },
    },
    database: {
      empty: {
        title: "Your database is empty",
        description:
          "Start building your collection by adding your first record.",
        action: "Add First Record",
      },
    },
  },
  errors: {
    auth: {
      authenticationFailed: "Authentication failed",
      unexpectedError: "Unexpected error",
    },
    exConfig: {
      failedToConfigure: "Failed to configure:",
    },
  },
} as const;
