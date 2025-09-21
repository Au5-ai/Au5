"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { userApi } from "../network/api/user";
import { tokenStorageService } from "../lib/localStorage";
import { LoginRequest, LoginResponse } from "../types";
import { ApiError } from "../types/network";
import { GLOBAL_CAPTIONS } from "../i18n/captions";
import { authController } from "../network/api/authController";
import { ROUTES } from "../routes";

export function useUser() {
  return useQuery({
    queryKey: ["user"],
    queryFn: () => userApi.me(),
    enabled: tokenStorageService.isValid(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: false,
  });
}

// --- Hooks ---
export function useLogin() {
  const queryClient = useQueryClient();

  return useMutation<LoginResponse, unknown, LoginRequest>({
    mutationFn: authController.login,
    onSuccess: (data) => {
      handleAuthSuccess(data, queryClient);
    },
  });
}

export function useLogout() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: () => authController.logout(),
    onSuccess: () => {
      tokenStorageService.remove();
      queryClient.clear();
      router.push(ROUTES.LOGIN);
    },
    onError: () => {
      tokenStorageService.remove();
      queryClient.clear();
      router.push(ROUTES.LOGIN);
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

export function handleAuthSuccess(
  data: LoginResponse,
  queryClient: ReturnType<typeof useQueryClient>,
) {
  tokenStorageService.set(data.accessToken);
  queryClient.invalidateQueries({ queryKey: ["user"] });
}

export function handleAuthError(error: unknown) {
  if (error instanceof ApiError) {
    return (
      error.problemDetails?.detail ||
      error.title ||
      GLOBAL_CAPTIONS.errors.auth.authenticationFailed
    );
  }
  return GLOBAL_CAPTIONS.errors.auth.unexpectedError;
}
