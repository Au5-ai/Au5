import { useQuery } from "@tanstack/react-query";
import { userController } from "../network/api/userController";
import { tokenStorageService } from "../lib/localStorage";
import { spaceController } from "../network/api/spaceController";

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

export function useCurrentUserSpaces() {
  return useQuery({
    queryKey: ["userSpaces"],
    queryFn: () => spaceController.mySpaces(),
    enabled: tokenStorageService.isValid(),
    staleTime: 500 * 60 * 1000, // 500 minutes
    retry: false,
  });
}
