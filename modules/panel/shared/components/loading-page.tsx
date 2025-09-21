"use client";

import { GLOBAL_CAPTIONS } from "@/shared/i18n/captions";

interface LoadingPageProps {
  text?: string;
  className?: string;
}

export function LoadingPage({ 
  text = GLOBAL_CAPTIONS.loading, 
  className = "" 
}: LoadingPageProps) {
  return (
    <div className={`gradient-bg bg-muted flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10 ${className}`}>
      <div className="min-h-100 w-full flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">
            {text}
          </p>
        </div>
      </div>
    </div>
  );
}