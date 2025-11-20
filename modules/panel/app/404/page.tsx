"use client";

import { Button } from "@/shared/components/ui";
import { Frown, ShieldAlert } from "lucide-react";
import { useRouter } from "next/navigation";

export default function NotFoundPage() {
  const router = useRouter();
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="text-center px-6 py-12 max-w-lg">
        <div className="mb-8 flex justify-center">
          <div className="relative">
            <div className="absolute inset-0 bg-red-500/20 blur-2xl rounded-full"></div>
            <Frown className="w-24 h-24 text-red-500 relative" />
          </div>
        </div>

        <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Not Found</h2>
        <p className="text-gray-600 mb-8 leading-relaxed">
          The page you are looking for does not exist. It might have been moved
          or deleted.
        </p>

        <div className="flex gap-4 justify-center">
          <Button
            onClick={() => router.back()}
            variant="outline"
            className="px-6">
            Go Back
          </Button>
        </div>
      </div>
    </div>
  );
}
