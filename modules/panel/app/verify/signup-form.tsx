"use client";

import { cn, validateEmail, validatePassword } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { useSignup } from "@/hooks/use-auth";
import { AddUserRequest } from "@/type";

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

    // Clear error when user starts typing
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

    // Email validation
    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!validateEmail(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    // Full name validation
    if (!formData.fullname.trim()) {
      newErrors.fullname = "Full name is required";
    } else if (
      formData.fullname.trim().length < 2 ||
      formData.fullname.trim().length > 50
    ) {
      newErrors.fullname =
        "Full name must be at least 2 characters and at most 50 characters";
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (!validatePassword(formData.password)) {
      newErrors.password =
        "Password must be at least 8 characters with uppercase, lowercase, number, and special character";
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
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
          <CardTitle className="text-xl">Create Account</CardTitle>
          <CardDescription>
            Sign up with your personal/organization email account
          </CardDescription>
        </CardHeader>
        <CardContent className="mt-6">
          <form onSubmit={handleSubmit}>
            <div className="grid gap-6">
              <div className="grid gap-6">
                <div className="grid gap-2">
                  <Label htmlFor="email">Username (Email)</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="m@example.com"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    className={errors.email ? "border-red-500" : ""}
                    required
                  />
                  {errors.email && (
                    <p className="text-sm text-red-500 mt-1">{errors.email}</p>
                  )}
                  <p className="text-xs text-gray-500 mt-1">
                    Please use your work or organization email. This account is
                    for business purposes only.
                  </p>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="fullname">Full Name</Label>
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
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter a strong password"
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
                    Must be at least 8 characters with uppercase, lowercase,
                    number, and special character
                  </p>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="confirmPassword">Repeat Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="Confirm your password"
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
                  disabled={signupMutation.isPending}
                >
                  {signupMutation.isPending ? "Signing Up..." : "Sign Up"}
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
      <div className="text-muted-foreground *:[a]:hover:text-primary text-center text-xs text-balance *:[a]:underline *:[a]:underline-offset-4">
        By clicking continue, you agree to our <a href="#">Terms of Service</a>{" "}
        and <a href="#">Privacy Policy</a>.
      </div>
    </div>
  );
}
