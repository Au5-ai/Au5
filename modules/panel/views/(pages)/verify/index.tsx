"use client";

import Logo from "@/shared/components/logo";
import { LoadingPage } from "@/shared/components/loading-page";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Custom404 from "@/shared/components/not-found";
import { userController } from "./userController";
import { SignupForm } from "./components/signup-form";

export default function VerifyUserPage() {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<"loading" | "ok" | "error">("loading");
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    const userId = searchParams.get("id");
    const hash = searchParams.get("hash");
    if (!userId || !hash) {
      setStatus("error");
      return;
    }
    const verify = async () => {
      try {
        const response = await userController.verify(userId, hash);
        setStatus(response ? "ok" : "error");
        setEmail(response.email);
      } catch {
        setStatus("error");
      }
    };
    verify();
  }, [searchParams]);

  if (status === "loading") {
    return <LoadingPage />;
  }

  if (status === "ok") {
    return (
      <div className="gradient-bg bg-muted flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
        <div className="flex w-full max-w-sm flex-col gap-6">
          <Logo href="#" text="Au5.ai" />
          <SignupForm email={email} />
        </div>
      </div>
    );
  }

  return (
    <div className="gradient-bg bg-muted flex min-h-svh flex-col items-center justify-center">
      <Custom404 />
    </div>
  );
}
