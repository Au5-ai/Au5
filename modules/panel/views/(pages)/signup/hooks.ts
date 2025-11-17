import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AddUserRequest, AddUserResponse } from "./types";
import { useRouter } from "next/navigation";
import { signupController } from "./signupController";
import { handleAuthSuccess } from "@/shared/hooks/use-auth";
import { authController } from "@/shared/network/api/authController";
import { ROUTES } from "@/shared/routes";
import { GLOBAL_CAPTIONS } from "@/shared/i18n/captions";

export function useSignup() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation<AddUserResponse, unknown, AddUserRequest>({
    mutationFn: signupController.createAdmin,
    onSuccess: async (response, signupData) => {
      if (!response.isDone) {
        throw new Error(GLOBAL_CAPTIONS.pages.signup.singupException);
      }

      try {
        const loginResponse = await authController.login({
          username: signupData.email,
          password: signupData.password,
        });

        handleAuthSuccess(loginResponse, queryClient);
        router.push(ROUTES.PLAYGROUND);
      } catch (loginError) {
        console.error("Auto-login after signup failed:", loginError);
        router.push(ROUTES.LOGIN);
      }
    },
    // onError: (error) => {
    //   const message = handleAuthError(error);
    //   toast.error(message);
    // },
  });
}
