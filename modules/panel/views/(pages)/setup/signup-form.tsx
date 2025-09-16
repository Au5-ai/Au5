"use client";

import { cn, validateEmail, validatePassword } from "@/shared/lib/utils";
import { Button } from "@/shared/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { useState } from "react";
import { useSignup } from "./hooks";
import { AddUserRequest } from "./types";
import { CAPTIONS } from "./i18n";
import { GLOBAL_CAPTIONS } from "@/shared/i18n/captions";

export function SignupForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [formData, setFormData] = useState({
    email: "",
    fullname: "",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState({
    email: "",
    fullname: "",
    password: "",
    confirmPassword: "",
  });

  const signupMutation = useSignup();

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    if (errors[field as keyof typeof errors]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {
      email: "",
      fullname: "",
      password: "",
      confirmPassword: "",
    };

    if (!formData.email) {
      newErrors.email = GLOBAL_CAPTIONS.validation.email.required;
    } else if (!validateEmail(formData.email)) {
      newErrors.email = GLOBAL_CAPTIONS.validation.email.invalid;
    }

    if (!formData.fullname.trim()) {
      newErrors.fullname = GLOBAL_CAPTIONS.validation.fullname.required;
    } else if (
      formData.fullname.trim().length < 2 ||
      formData.fullname.trim().length > 50
    ) {
      newErrors.fullname = GLOBAL_CAPTIONS.validation.fullname.invalidLength;
    }

    if (!formData.password) {
      newErrors.password = GLOBAL_CAPTIONS.validation.password.required;
    } else if (!validatePassword(formData.password)) {
      newErrors.password = GLOBAL_CAPTIONS.validation.password.invalid;
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword =
        GLOBAL_CAPTIONS.validation.confirmPassword.required;
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword =
        GLOBAL_CAPTIONS.validation.confirmPassword.mismatch;
    }

    setErrors(newErrors);
    return !Object.values(newErrors).some((error) => error !== "");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      const signupData: AddUserRequest = {
        email: formData.email,
        fullName: formData.fullname,
        password: formData.password,
        repeatedPassword: formData.confirmPassword,
      };

      signupMutation.mutate(signupData);
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">{CAPTIONS.form.title}</CardTitle>
          <CardDescription>{CAPTIONS.form.description}</CardDescription>
        </CardHeader>
        <CardContent className="mt-6">
          <form onSubmit={handleSubmit}>
            <div className="grid gap-6">
              <div className="grid gap-6">
                <div className="grid gap-2">
                  <Label htmlFor="email">
                    {GLOBAL_CAPTIONS.fields.email.label}
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder={GLOBAL_CAPTIONS.fields.email.placeholder}
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    className={errors.email ? "border-red-500" : ""}
                    required
                  />
                  {errors.email && (
                    <p className="text-sm text-red-500 mt-1">{errors.email}</p>
                  )}
                  <p className="text-xs text-gray-500 mt-1">
                    {GLOBAL_CAPTIONS.fields.email.hint}
                  </p>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="fullname">
                    {GLOBAL_CAPTIONS.fields.fullname.label}
                  </Label>
                  <Input
                    id="fullname"
                    type="text"
                    value={formData.fullname}
                    onChange={(e) =>
                      handleInputChange("fullname", e.target.value)
                    }
                    className={errors.fullname ? "border-red-500" : ""}
                    required
                  />
                  {errors.fullname && (
                    <p className="text-sm text-red-500 mt-1">
                      {errors.fullname}
                    </p>
                  )}
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="password">
                    {GLOBAL_CAPTIONS.fields.password.label}
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder={GLOBAL_CAPTIONS.fields.password.placeholder}
                    value={formData.password}
                    onChange={(e) =>
                      handleInputChange("password", e.target.value)
                    }
                    className={errors.password ? "border-red-500" : ""}
                    required
                  />
                  {errors.password && (
                    <p className="text-sm text-red-500 mt-1">
                      {errors.password}
                    </p>
                  )}
                  <p className="text-xs text-gray-500 mt-1">
                    {GLOBAL_CAPTIONS.fields.password.hint}
                  </p>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="confirmPassword">
                    {GLOBAL_CAPTIONS.fields.confirmPassword.label}
                  </Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder={
                      GLOBAL_CAPTIONS.fields.confirmPassword.placeholder
                    }
                    value={formData.confirmPassword}
                    onChange={(e) =>
                      handleInputChange("confirmPassword", e.target.value)
                    }
                    className={errors.confirmPassword ? "border-red-500" : ""}
                    required
                  />
                  {errors.confirmPassword && (
                    <p className="text-sm text-red-500 mt-1">
                      {errors.confirmPassword}
                    </p>
                  )}
                </div>

                <Button
                  type="submit"
                  className="w-full cursor-pointer"
                  disabled={signupMutation.isPending}>
                  {signupMutation.isPending
                    ? CAPTIONS.form.submittingButton
                    : CAPTIONS.form.submitButton}
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
      <div className="text-muted-foreground *:[a]:hover:text-primary text-center text-xs text-balance *:[a]:underline *:[a]:underline-offset-4">
        {CAPTIONS.footer.text} <a href="#">{CAPTIONS.footer.terms}</a>{" "}
        {CAPTIONS.footer.and} <a href="#">{CAPTIONS.footer.privacy}</a>.
      </div>
    </div>
  );
}
