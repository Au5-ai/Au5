import { Suspense } from "react";
import OnboardingClient from "./components/onboardingClient";

export default function OnboardingPage() {
  return (
    <Suspense fallback={null}>
      <OnboardingClient />
    </Suspense>
  );
}
