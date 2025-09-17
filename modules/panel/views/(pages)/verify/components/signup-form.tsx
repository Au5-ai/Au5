"use client";

import { cn, validatePassword } from "@/shared/lib/utils";
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
import { GLOBAL_CAPTIONS } from "@/shared/i18n/captions";
import { useSignup } from "../hooks";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Mail } from "lucide-react";
import { AddUserRequest } from "../types";

export function SignupForm({
  email,
  className,
  ...props
}: React.ComponentProps<"div">) {
  const searchParams = useSearchParams();
  const [formData, setFormData] = useState({
    fullname: "",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState({
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
      fullname: "",
      password: "",
      confirmPassword: "",
    };

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

    const userId = searchParams.get("id");
    const hash = searchParams.get("hash");
    if (!userId || !hash) {
      toast.error(GLOBAL_CAPTIONS.errors.signup.urlIsInvalid);
      return;
    }

    if (validateForm()) {
      const signupData: AddUserRequest = {
        userId: userId,
        hashedEmail: hash,
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
          <CardTitle className="text-xl">
            {GLOBAL_CAPTIONS.pages.signup.form.title}
          </CardTitle>
          <CardDescription>
            Sign up with your <b>{email}</b> email account
          </CardDescription>
        </CardHeader>
        <CardContent className="mt-6">
          <form onSubmit={handleSubmit}>
            <div className="grid gap-6">
              <div className="grid gap-6">
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
                    ? GLOBAL_CAPTIONS.pages.signup.form.submittingButton
                    : GLOBAL_CAPTIONS.pages.signup.form.submitButton}
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
      <div className="text-muted-foreground *:[a]:hover:text-primary text-center text-xs text-balance *:[a]:underline *:[a]:underline-offset-4">
        {GLOBAL_CAPTIONS.pages.signup.footer.text}{" "}
        <a href="#">{GLOBAL_CAPTIONS.pages.signup.footer.terms}</a>{" "}
        {GLOBAL_CAPTIONS.pages.signup.footer.and}{" "}
        <a href="#">{GLOBAL_CAPTIONS.pages.signup.footer.privacy}</a>.
      </div>
    </div>
  );
}
