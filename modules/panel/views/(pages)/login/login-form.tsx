"use client";

import { cn } from "@/shared/lib/utils";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { loginCaptions } from "./i18n";
import { GLOBAL_CAPTIONS } from "@/shared/i18n/captions";
import { EyeClosed, Loader2 } from "lucide-react";
import { ROUTES } from "@/shared/routes";
import { Eye } from "lucide-react";
import { useState } from "react";
import { useLoginForm } from "./hooks/use-login-form";

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"form">) {
  const [showPassword, setShowPassword] = useState(false);
  const {
    username,
    setUsername,
    password,
    handlePasswordChange,
    handleSubmit,
    isPending,
  } = useLoginForm();

  return (
    <form
      className={cn("flex flex-col gap-6", className)}
      onSubmit={handleSubmit}
      {...props}>
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-bold">{loginCaptions.title}</h1>
        <p className="text-muted-foreground text-sm text-balance">
          {loginCaptions.subtitle}
        </p>
      </div>
      <div className="grid gap-6">
        <div className="grid gap-3">
          <Label htmlFor="email">{GLOBAL_CAPTIONS.fields.email.label}</Label>
          <Input
            id="email"
            type="email"
            placeholder={GLOBAL_CAPTIONS.fields.email.placeholder}
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>

        <div className="grid gap-3">
          <div className="flex items-center">
            <Label htmlFor="password">
              {GLOBAL_CAPTIONS.fields.password.label}
            </Label>
          </div>

          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => handlePasswordChange(e.target.value)}
              required
              className="pr-10"
            />

            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              aria-label={showPassword ? "Hide password" : "Show password"}>
              {showPassword ? <EyeClosed size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        <Button
          type="submit"
          className="w-full cursor-pointer"
          disabled={isPending}>
          {isPending ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              {loginCaptions.loggingInButton}
            </>
          ) : (
            loginCaptions.loginButton
          )}
        </Button>

        <div className="after:border-border relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t">
          <span className="bg-background text-muted-foreground relative z-10 px-2">
            {loginCaptions.orContinueWith}
          </span>
        </div>
      </div>
      <div className="text-center text-sm">
        {loginCaptions.noAccountText}{" "}
        <a href={ROUTES.SIGNUP} className="underline underline-offset-4">
          {loginCaptions.createAccountLink}
        </a>
      </div>
    </form>
  );
}
