"use client";

import { Button } from "@/shared/components/ui/button";
import Logo from "@/shared/components/logo";
import Image from "next/image";
import { GLOBAL_CAPTIONS } from "@/shared/i18n/captions";
import { ROUTES } from "@/shared/routes";
import { useRouter } from "next/navigation";
import { CheckCircle } from "lucide-react";

export default function RegisteredPage() {
  const router = useRouter();

  const handleLoginRedirect = () => {
    router.push(ROUTES.LOGIN);
  };

  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex justify-center gap-2 md:justify-start">
          <Logo href="#" text={GLOBAL_CAPTIONS.brandName} />
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-md">
            <div className="flex flex-col items-center gap-6 text-center">
              <div className="rounded-full bg-green-100 p-4 dark:bg-green-900/20">
                <CheckCircle className="h-12 w-12 text-green-600 dark:text-green-500" />
              </div>
              <div className="space-y-2">
                <h1 className="text-3xl font-bold">
                  {GLOBAL_CAPTIONS.pages.registered.messageTitle}
                </h1>
                <p className="text-muted-foreground text-lg">
                  {GLOBAL_CAPTIONS.pages.registered.description}
                </p>
              </div>
              <Button
                onClick={handleLoginRedirect}
                className="w-full max-w-xs cursor-pointer mt-4"
                size="lg">
                {GLOBAL_CAPTIONS.pages.registered.loginButton}
              </Button>
            </div>
          </div>
        </div>
      </div>
      <div className="relative hidden lg:block bg-gradient flex-col items-center justify-center p-8">
        <div className="flex flex-col items-center justify-center h-full max-w-md text-center">
          <h2 className="text-3xl font-bold mb-8">
            {GLOBAL_CAPTIONS.pages.registered.title}
          </h2>
          <div className="mb-8">
            <Image
              src="/assets/images/complete-registration.png"
              alt="Registration complete illustration"
              width={256}
              height={256}
              className="object-contain"
              style={{ height: "auto" }}
            />
          </div>
          <p className="text-black-100 text-lg leading-relaxed">
            {GLOBAL_CAPTIONS.pages.registered.description}
          </p>
        </div>
      </div>
    </div>
  );
}
