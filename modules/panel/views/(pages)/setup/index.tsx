"use client";

import { SignupForm } from "@/views/(pages)/setup/components/signup-form";
import Logo from "@/shared/components/logo";
import { LoadingPage } from "@/shared/components/loading-page";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { setupController } from "./setupController";
import { ROUTES } from "@/shared/routes";
import { GLOBAL_CAPTIONS } from "@/shared/i18n/captions";

export default function SignupPage() {
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkAdminStatus = async () => {
      try {
        const response = await setupController.helloAdmin();
        setIsAdmin(response.helloFromAdmin);

        if (response.helloFromAdmin) {
          router.push(ROUTES.LOGIN);
        }
      } catch (error) {
        console.error(error);
        router.push(ROUTES.LOGIN);
      } finally {
        setIsLoading(false);
      }
    };

    checkAdminStatus();
  }, [router]);

  if (isLoading) {
    return (
      <div className="bg-gradient bg-muted flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
        <LoadingPage />
      </div>
    );
  }

  if (isAdmin) {
    return null;
  }

  return (
    <div className="bg-gradient bg-muted flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <Logo href="#" text={GLOBAL_CAPTIONS.brandName} />
        <SignupForm />
      </div>
    </div>
  );
}
