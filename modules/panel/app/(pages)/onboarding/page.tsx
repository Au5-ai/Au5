import { Suspense } from "react";
import OnboardingClientWrapper from "@/views/(pages)/onboarding";
import OnboardingLoading from "@/shared/components/OnboardingLoading";

export const dynamic = "force-static";

export default function OnboardingPage() {
  return (
    <Suspense fallback={<OnboardingLoading />}>     
      <OnboardingClientWrapper />
    </Suspense>
  );
}