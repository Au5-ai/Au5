export const GLOBAL_CAPTIONS = {
  back: "Back",
  next: "Next",
  brandName: "Riter",
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
    never: "Never",
  },

  // Common actions
  actions: {
    cancel: "Cancel",
    done: "Done",
    succeeded: "Succeeded",
    failed: "Failed",
    sending: "Sending...",
    moveToArchive: "Move to Archive",
    removeFromArchive: "Remove from Archive",
    export: "Export",
    exportToText: "Export to Text",
    exportToPdf: "Export to PDF (Coming Soon)",
  },
  fields: {
    email: {
      label: "Username (Email)",
      placeholder: "m@example.com",
      hint: "Please use your work or organization email.",
    },
    fullname: {
      label: "Full Name",
      placeholder: "Enter your full name",
    },
    organizationName: {
      label: "Organization Name",
      placeholder: "Enter your organization name",
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
    organizationName: {
      required: "Organization name is required",
      invalidLength:
        "Organization name must be at least 2 characters and at most 100 characters",
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
        text: "made with ❤️ in earth.",
      },
    },
    registered: {
      title: "Already Registered",
      description:
        "Your account has been successfully created. Please log in with your username and password to continue.",
      loginButton: "Go to Login",
      messageTitle: "Registration Complete",
    },
    meetings: {
      aiAssistants: "AI Assistants",
      speakerSttistics: "Speaker Statistics",
      archivedSuccess: "Meeting has been archived successfully",
      unarchivedSuccess: "Meeting has been removed from archive successfully",
      removeSuccess: "Meeting has been removed successfully",
      removeError: "Failed to remove meeting. Please try again.",
      deleteAIContentSuccess: "AI content has been deleted successfully",
      deleteAIContentError: "Failed to delete AI content. Please try again.",
      exportSuccess: "Meeting transcription exported successfully",
      exportError: "Failed to export meeting transcription. Please try again.",
      renameSuccess: "Meeting has been renamed successfully",
      renameError: "Failed to rename meeting. Please try again.",
    },
  },
} as const;
