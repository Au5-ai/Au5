import { validateEmail, validatePassword } from "@/shared/lib/utils";
import { GLOBAL_CAPTIONS } from "@/shared/i18n/captions";
import { VALIDATION_RULES } from "./validation-constants";

export type ValidationResult = {
  isValid: boolean;
  error: string;
};

export const validators = {
  email: (value: string): ValidationResult => {
    if (!value) {
      return {
        isValid: false,
        error: GLOBAL_CAPTIONS.validation.email.required,
      };
    }
    if (!validateEmail(value)) {
      return {
        isValid: false,
        error: GLOBAL_CAPTIONS.validation.email.invalid,
      };
    }
    return { isValid: true, error: "" };
  },

  fullname: (value: string): ValidationResult => {
    const trimmed = value.trim();
    if (!trimmed) {
      return {
        isValid: false,
        error: GLOBAL_CAPTIONS.validation.fullname.required,
      };
    }
    if (
      trimmed.length < VALIDATION_RULES.fullname.min ||
      trimmed.length > VALIDATION_RULES.fullname.max
    ) {
      return {
        isValid: false,
        error: GLOBAL_CAPTIONS.validation.fullname.invalidLength,
      };
    }
    return { isValid: true, error: "" };
  },

  organizationName: (value: string): ValidationResult => {
    const trimmed = value.trim();
    if (!trimmed) {
      return {
        isValid: false,
        error: GLOBAL_CAPTIONS.validation.organizationName.required,
      };
    }
    if (
      trimmed.length < VALIDATION_RULES.organizationName.min ||
      trimmed.length > VALIDATION_RULES.organizationName.max
    ) {
      return {
        isValid: false,
        error: GLOBAL_CAPTIONS.validation.organizationName.invalidLength,
      };
    }
    return { isValid: true, error: "" };
  },

  password: (value: string): ValidationResult => {
    if (!value) {
      return {
        isValid: false,
        error: GLOBAL_CAPTIONS.validation.password.required,
      };
    }
    if (!validatePassword(value)) {
      return {
        isValid: false,
        error: GLOBAL_CAPTIONS.validation.password.invalid,
      };
    }
    return { isValid: true, error: "" };
  },

  confirmPassword: (value: string, password: string): ValidationResult => {
    if (!value) {
      return {
        isValid: false,
        error: GLOBAL_CAPTIONS.validation.confirmPassword.required,
      };
    }
    if (value !== password) {
      return {
        isValid: false,
        error: GLOBAL_CAPTIONS.validation.confirmPassword.mismatch,
      };
    }
    return { isValid: true, error: "" };
  },
};
