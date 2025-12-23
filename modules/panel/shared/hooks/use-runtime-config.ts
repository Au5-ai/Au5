"use client";

import { useQuery } from "@tanstack/react-query";

interface RuntimeConfig {
  apiBaseUrl: string;
}

export function useRuntimeConfig() {
  return useQuery<RuntimeConfig>({
    queryKey: ["runtime-config"],
    queryFn: async () => {
      const response = await fetch("/api/config");
      if (!response.ok) {
        throw new Error("Failed to fetch runtime config");
      }
      return response.json();
    },
    staleTime: Infinity, // Config doesn't change during runtime
    refetchOnWindowFocus: false,
  });
}
