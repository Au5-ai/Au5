import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AddUserRequest, AddUserResponse } from "../types";
import { useRouter } from "next/navigation";
import { signupController } from "../api/signup-controller";
import { handleAuthSuccess } from "@/shared/hooks/use-auth";
import { authController } from "@/shared/network/api/authController";
import { ROUTES } from "@/shared/routes";
import { GLOBAL_CAPTIONS } from "@/shared/i18n/captions";
import { toast } from "sonner";
import { ApiError } from "next/dist/server/api-utils";

export function useSignup() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation<AddUserResponse, ApiError, AddUserRequest>({
    mutationFn: signupController.createAdmin,
    onSuccess: async (response, signupData) => {
      if (!response.isDone) {
        console.log("Signup not completed:", response);
        toast.error(GLOBAL_CAPTIONS.pages.signup.singupException);
        return;
      }

      toast.success(GLOBAL_CAPTIONS.pages.signup.signupSuccess);
      try {
        const loginResponse = await authController.login({
          username: signupData.email,
          password: signupData.password,
        });

        handleAuthSuccess(loginResponse, queryClient);
        router.push(ROUTES.PLAYGROUND);
      } catch {
        router.push(ROUTES.LOGIN);
      }
    },
    onError: (error) => {
      toast.error(
        error.message || GLOBAL_CAPTIONS.pages.signup.singupException,
      );
    },
  });
}
