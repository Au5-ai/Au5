export const GLOBAL_CAPTIONS = {
  back: "Back",
  next: "Next",
  brandName: "Au5.ai",
  playground: "playground",
  loading: "Loading ...",
  loadingConfigs: "Loading Configs...",
  loadingTranscription: "Loading Transcription...",
  roles: {
    admin: "Admin",
    user: "User",
    administrator: "Administrator",
  },

  // Common status labels
  status: {
    active: "Active",
    disabled: "Disabled",
    enabled: "Enabled",
    never: "Never",
  },

  // Common actions
  actions: {
    cancel: "Cancel",
    done: "Done",
    succeeded: "Succeeded",
    failed: "Failed",
    sending: "Sending...",
  },
  fields: {
    email: {
      label: "Username (Email)",
      placeholder: "m@example.com",
      hint: "Please use your work or organization email. This account is for business purposes only.",
    },
    fullname: {
      label: "Full Name",
    },
    password: {
      label: "Password",
      placeholder: "Enter a strong password",
      hint: "Must be at least 8 characters with uppercase, lowercase, number, and special character",
    },
    confirmPassword: {
      label: "Repeat Password",
      placeholder: "Confirm your password",
    },
  },
  validation: {
    email: {
      required: "Email is required",
      invalid: "Please enter a valid email address",
    },
    fullname: {
      required: "Full name is required",
      invalidLength:
        "Full name must be at least 2 characters and at most 50 characters",
    },
    password: {
      required: "Password is required",
      invalid:
        "Password must be at least 8 characters with uppercase, lowercase, number, and special character",
    },
    confirmPassword: {
      required: "Please confirm your password",
      mismatch: "Passwords do not match",
    },
  },
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
    signup: {
      urlIsInvalid:
        "Url is not valid, Please click on your verificaion link on your email",
    },
  },
  pages: {
    signup: {
      singupException: "Signup was not completed successfully",
      signupSuccess: "Signup was completed successfully",
      form: {
        title: "Create Account",
        description: "Sign up with your personal/organization email account",
        submitButton: "Sign Up",
        submittingButton: "Signing Up...",
      },
      footer: {
        text: "By clicking continue, you agree to our",
        terms: "Terms of Service",
        and: "and",
        privacy: "Privacy Policy",
      },
    },
  },
} as const;
