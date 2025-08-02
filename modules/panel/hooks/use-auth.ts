"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import {
  authApi,
  tokenStorage,
  type LoginRequest,
  type LoginResponse,
} from "@/lib/api";

export function useLogin() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: (credentials: LoginRequest) => authApi.login(credentials),
    onSuccess: (data: LoginResponse) => {
      // Save the access token to localStorage
      tokenStorage.set(data.access_token);

      // Invalidate queries that might need the new token
      queryClient.invalidateQueries();

      // Redirect to dashboard or main page
      router.push("/dashboard");
    },
    onError: (error) => {
      console.error("Login failed:", error);
      error.message = "Invalid username or password";
      tokenStorage.remove();
    },
  });
}

export function useLogout() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: () => authApi.logout(),
    onSuccess: () => {
      // Remove token from localStorage
      tokenStorage.remove();

      // Clear all cached queries
      queryClient.clear();

      // Redirect to login page
      router.push("/login");
    },
    onError: () => {
      // Even if logout fails on server, clear local state
      tokenStorage.remove();
      queryClient.clear();
      router.push("/login");
    },
  });
}

// Hook to check if user is authenticated
export function useIsAuthenticated() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const checkAuth = () => {
      setIsAuthenticated(tokenStorage.isValid());
    };

    // Check on mount
    checkAuth();

    // Check on storage changes (for multi-tab support)
    window.addEventListener("storage", checkAuth);

    return () => {
      window.removeEventListener("storage", checkAuth);
    };
  }, []);

  return isAuthenticated;
}
