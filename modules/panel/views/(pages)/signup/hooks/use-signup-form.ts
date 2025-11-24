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
    const newErrors: FormErrors = {
      email: "",
      fullname: "",
      organizationName: "",
      password: "",
      confirmPassword: "",
    };

    const emailResult = validators.email(formData.email);
    newErrors.email = emailResult.error;

    const fullnameResult = validators.fullname(formData.fullname);
    newErrors.fullname = fullnameResult.error;

    const orgResult = validators.organizationName(formData.organizationName);
    newErrors.organizationName = orgResult.error;

    const passwordResult = validators.password(formData.password);
    newErrors.password = passwordResult.error;

    const confirmPasswordResult = validators.confirmPassword(
      formData.confirmPassword,
      formData.password,
    );
    newErrors.confirmPassword = confirmPasswordResult.error;

    setErrors(newErrors);
    return !Object.values(newErrors).some((error) => error !== "");
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
