"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { authApi, tokenStorage } from "@/lib/api";
import { LoginRequest, LoginResponse } from "@/type";

export function useLogin() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: (credentials: LoginRequest) => authApi.login(credentials),
    onSuccess: (data: LoginResponse) => {
      tokenStorage.set(data.accessToken);
      queryClient.invalidateQueries();

      const setup = localStorage.getItem("setup");
      if (!setup) {
        router.push("/setup");
        return;
      }
      router.push("/dashboard");
    },
    onError: (error) => {
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
      tokenStorage.remove();
      queryClient.clear();
      router.push("/login");
    },
    onError: () => {
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
    checkAuth();
    window.addEventListener("storage", checkAuth);

    return () => {
      window.removeEventListener("storage", checkAuth);
    };
  }, []);

  return isAuthenticated;
}
