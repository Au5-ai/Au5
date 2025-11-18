"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { tokenStorageService } from "../lib/localStorage";
import { LoginRequest, LoginResponse } from "../types";
import { ApiError } from "../types/network";
import { GLOBAL_CAPTIONS } from "../i18n/captions";
import { authController } from "../network/api/authController";
import { ROUTES } from "../routes";
import { organizationsController } from "@/views/(pages)/onboarding/organizationsController";

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
    onSettled: () => {
      tokenStorageService.remove();
      queryClient.clear();

      if (typeof window !== "undefined") {
        window.postMessage(
          {
            source: "AU5_PANEL",
            type: "TOKEN_REMOVE",
            payload: null,
          },
          "*",
        );
      }

      router.push(ROUTES.LOGIN);
    },
  });
}
export async function handleAuthSuccess(
  data: LoginResponse,
  queryClient: ReturnType<typeof useQueryClient>,
) {
  tokenStorageService.set(data.accessToken);
  queryClient.invalidateQueries({ queryKey: ["user"] });

  if (typeof window !== "undefined") {
    window.postMessage(
      {
        source: "AU5_PANEL",
        type: "TOKEN_UPDATE",
        payload: data.accessToken,
      },
      "*",
    );
  }

  const extensionConfig = await organizationsController.getExtensionConfig();
  if (extensionConfig) {
    window.postMessage(
      {
        source: "AU5_PANEL",
        type: "CONFIG_UPDATE",
        payload: extensionConfig,
      },
      "*",
    );
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
