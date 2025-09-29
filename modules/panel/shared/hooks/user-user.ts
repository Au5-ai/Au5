import { useQuery } from "@tanstack/react-query";
import { userController } from "../network/api/user";
import { tokenStorageService } from "../lib/localStorage";

export function useCurrentUser() {
  return useQuery({
    queryKey: ["user"],
    queryFn: () => userController.me(),
    enabled: tokenStorageService.isValid(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: false,
  });
}

export function useCurrentUserMenu() {
  return useQuery({
    queryKey: ["userMenu"],
    queryFn: () => userController.myMenu(),
    enabled: tokenStorageService.isValid(),
    staleTime: 500 * 60 * 1000, // 500 minutes
    retry: false,
  });
}
