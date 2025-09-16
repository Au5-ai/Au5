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
  const router = useRouter();

  return useMutation<LoginResponse, unknown, LoginRequest>({
    mutationFn: authController.login,
    onSuccess: (data) => handleAuthSuccess(data, false, queryClient, router),
    // onError: (error) => {
    //   tokenStorageService.remove();
    //   const message = handleAuthError(error);
    //   toast.error(message);
    // },
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

export function handleAuthSuccess(
  data: LoginResponse,
  isAdmin: boolean,
  queryClient: ReturnType<typeof useQueryClient>,
  router: ReturnType<typeof useRouter>,
) {
  tokenStorageService.set(data.accessToken);
  queryClient.invalidateQueries({ queryKey: ["user"] });

  if (isAdmin) {
    router.push("/playground");
  } else {
    const setup = localStorage.getItem("eConfig");
    router.push(setup ? "/playground" : "/exConfig");
  }
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
