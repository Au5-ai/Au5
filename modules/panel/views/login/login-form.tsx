"use client";

import { cn } from "@/shared/lib/utils";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { useLogin } from "@/shared/hooks/use-auth";
import { useState } from "react";
import { loginCaptions } from "./i18n";

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"form">) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const loginMutation = useLogin();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loginMutation.mutate({ username, password });
  };

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
          <Label htmlFor="email">{loginCaptions.emailLabel}</Label>
          <Input
            id="email"
            type="email"
            placeholder={loginCaptions.emailPlaceholder}
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        <div className="grid gap-3">
          <div className="flex items-center">
            <Label htmlFor="password">{loginCaptions.passwordLabel}</Label>
          </div>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        {/* {loginMutation.error && (
          <div className="text-sm text-red-600 text-center">
            {loginMutation.error instanceof Error
              ? loginMutation.error.message
              : "Login failed. Please try again."}
          </div>
        )} */}
        <Button
          type="submit"
          className="w-full cursor-pointer"
          disabled={loginMutation.isPending}>
          {loginMutation.isPending ? loginCaptions.loggingInButton : loginCaptions.loginButton}
        </Button>
        <div className="after:border-border relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t">
          <span className="bg-background text-muted-foreground relative z-10 px-2">
            {loginCaptions.orContinueWith}
          </span>
        </div>
      </div>
      <div className="text-center text-sm">
        {loginCaptions.noAccountText}{" "}
        <a href="#" className="underline underline-offset-4">
          {loginCaptions.contactAdminLink}
        </a>
      </div>
    </form>
  );
}