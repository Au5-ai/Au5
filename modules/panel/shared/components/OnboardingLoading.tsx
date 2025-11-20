import { GLOBAL_CAPTIONS } from "@/shared/i18n/captions";

export default function OnboardingLoading() {
  return (
    <div className="bg-gradient bg-muted flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4" />
        <p className="text-gray-600 font-medium">
          {GLOBAL_CAPTIONS.loading}
        </p>
      </div>
    </div>
  );
}