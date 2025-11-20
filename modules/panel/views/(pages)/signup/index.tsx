"use client";

import { SignupForm } from "@/views/(pages)/signup/components/signup-form";
import Logo from "@/shared/components/logo";
import { GLOBAL_CAPTIONS } from "@/shared/i18n/captions";

export default function SignupPage() {
  return (
    <div className="bg-gradient bg-muted flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
      <div className="flex w-[600px] flex-col gap-6">
        <Logo href="#" text={GLOBAL_CAPTIONS.brandName} />
        <SignupForm />
      </div>
    </div>
  );
}
