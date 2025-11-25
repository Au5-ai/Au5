import { useState } from "react";
import { AddUserRequest } from "../types";
import { useSignup } from "./use-signup";
import { validators } from "../utils";

interface FormData {
  email: string;
  fullname: string;
  organizationName: string;
  password: string;
  confirmPassword: string;
}

interface FormErrors {
  email: string;
  fullname: string;
  organizationName: string;
  password: string;
  confirmPassword: string;
}

export function useSignupForm() {
  const [formData, setFormData] = useState<FormData>({
    email: "",
    fullname: "",
    organizationName: "",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState<FormErrors>({
    email: "",
    fullname: "",
    organizationName: "",
    password: "",
    confirmPassword: "",
  });

  const signupMutation = useSignup();

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const validateForm = (): boolean => {
    const results = {
      email: validators.email(formData.email),
      fullname: validators.fullname(formData.fullname),
      organizationName: validators.organizationName(formData.organizationName),
      password: validators.password(formData.password),
      confirmPassword: validators.confirmPassword(
        formData.confirmPassword,
        formData.password,
      ),
    };

    const newErrors = {
      email: results.email.error,
      fullname: results.fullname.error,
      organizationName: results.organizationName.error,
      password: results.password.error,
      confirmPassword: results.confirmPassword.error,
    };

    setErrors(newErrors);

    return Object.values(results).every((result) => result.isValid);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      const signupData: AddUserRequest = {
        email: formData.email,
        fullName: formData.fullname,
        organizationName: formData.organizationName,
        password: formData.password,
        repeatedPassword: formData.confirmPassword,
      };

      signupMutation.mutate(signupData);
    }
  };

  return {
    formData,
    errors,
    isSubmitting: signupMutation.isPending,
    handleInputChange,
    handleSubmit,
  };
}
