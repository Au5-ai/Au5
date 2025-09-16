import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { AddUserRequest, AddUserResponse } from "./types";
import { useRouter } from "next/navigation";
import { setupController } from "./setupController";
import { handleAuthError, handleAuthSuccess } from "@/shared/hooks/use-auth";
import { authController } from "@/shared/network/api/authController";
import { setupCaptions } from "./i18n";

export function useSignup() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation<AddUserResponse, unknown, AddUserRequest>({
    mutationFn: setupController.addAdmin,
    onSuccess: async (response, signupData) => {
      if (!response.isDone) {
        throw new Error(setupCaptions.singupException);
      }

      try {
        const loginResponse = await authController.login({
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
