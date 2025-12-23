export const VALIDATION_RULES = {
  fullname: {
    min: 2,
    max: 50,
  },
  organizationName: {
    min: 2,
    max: 100,
  },
} as const;
