"use client";

import { GLOBAL_CAPTIONS } from "@/shared/i18n/captions";

interface LoadingPageProps {
  text?: string;
  className?: string;
}

export function LoadingPage({
  text = GLOBAL_CAPTIONS.loading,
}: LoadingPageProps) {
  return (
    <div className="min-h-100 w-full flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-600 font-medium">{text}</p>
      </div>
    </div>
  );
}
