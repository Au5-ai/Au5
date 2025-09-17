import { useMutation } from "@tanstack/react-query";
import { AddUserRequest, AddUserResponse } from "./types";
import { useRouter } from "next/navigation";
import { ROUTES } from "@/shared/routes";
import { GLOBAL_CAPTIONS } from "@/shared/i18n/captions";
import { userController } from "./userController";
import { toast } from "sonner";

export function useSignup() {
  const router = useRouter();

  return useMutation<AddUserResponse, unknown, AddUserRequest>({
    mutationFn: userController.verifyUser,
    onSuccess: async (response) => {
      if (!response.isDone) {
        throw new Error(GLOBAL_CAPTIONS.pages.signup.singupException);
      }

      toast.success(GLOBAL_CAPTIONS.pages.signup.signupSuccess);
      router.push(ROUTES.LOGIN);
    },
    // onError: (error) => {
    //   const message = handleAuthError(error);
    //   toast.error(message);
    // },
  });
}
