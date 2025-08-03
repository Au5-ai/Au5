"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { authApi } from "@/lib/api";
import { ApiError, LoginRequest, LoginResponse } from "@/type";
import { tokenStorageService } from "@/lib/services";

export function useLogin() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: (credentials: LoginRequest) => authApi.login(credentials),
    onSuccess: (data: LoginResponse) => {
      tokenStorageService.set(data.accessToken);
      queryClient.invalidateQueries();

      const setup = localStorage.getItem("setup");
      if (!setup) {
        router.push("/setup");
        return;
      }
      router.push("/dashboard");
    },
    onError: (error) => {
      console.error("Login error:", error);
      if (error instanceof ApiError) {
        error.message = error.problemDetails.detail || error.title;
      } else {
        error.message = "Unexpected error";
      }
      tokenStorageService.remove();
    },
  });
}

export function useLogout() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: () => authApi.logout(),
    onSuccess: () => {
      tokenStorageService.remove();
      queryClient.clear();
      router.push("/login");
    },
    onError: () => {
      tokenStorageService.remove();
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
      setIsAuthenticated(tokenStorageService.isValid());
    };
    checkAuth();
    window.addEventListener("storage", checkAuth);

    return () => {
      window.removeEventListener("storage", checkAuth);
    };
  }, []);

  return isAuthenticated;
}
