"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { ApiError, authApi, setUpApi, userApi } from "@/lib/api";
import {
  LoginRequest,
  LoginResponse,
  AddAdminRequest,
  AddAdminResponse,
} from "@/type";
import { tokenStorageService } from "@/lib/services";
import { toast } from "sonner";

// Hook to get current user data
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
    mutationFn: authApi.login,
    onSuccess: (data) => handleAuthSuccess(data, false, queryClient, router),
    onError: (error) => {
      tokenStorageService.remove();
      const message = handleAuthError(error);
      toast.error(message);
    },
  });
}

export function useSignup() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation<AddAdminResponse, unknown, AddAdminRequest>({
    mutationFn: setUpApi.addAdmin,
    onSuccess: async (response, signupData) => {
      if (!response.isDone) {
        throw new Error("Signup was not completed successfully");
      }

      try {
        const loginResponse = await authApi.login({
          username: signupData.email,
          password: signupData.password,
        });

        handleAuthSuccess(loginResponse, true, queryClient, router);
      } catch (loginError) {
        console.error("Auto-login after signup failed:", loginError);
        router.push("/login");
      }
    },
    onError: (error) => {
      const message = handleAuthError(error);
      toast.error(message);
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

function handleAuthSuccess(
  data: LoginResponse,
  isAdmin: boolean,
  queryClient: ReturnType<typeof useQueryClient>,
  router: ReturnType<typeof useRouter>
) {
  tokenStorageService.set(data.accessToken);
  queryClient.invalidateQueries({ queryKey: ["user"] });

  if (isAdmin) {
    router.push("/playground");
  } else {
    const setup = localStorage.getItem("eConfig");
    router.push(setup ? "/playground" : "/eConfig");
  }
}

function handleAuthError(error: unknown) {
  if (error instanceof ApiError) {
    return (
      error.problemDetails?.detail || error.title || "Authentication failed"
    );
  }
  return "Unexpected error";
}
