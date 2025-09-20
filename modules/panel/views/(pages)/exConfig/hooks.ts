import { useMutation } from "@tanstack/react-query";
import { AddUserRequest, AddUserResponse } from "./types";
import { GLOBAL_CAPTIONS } from "@/shared/i18n/captions";
import { userController } from "./userController";

export function useSignup() {
  return useMutation<AddUserResponse, unknown, AddUserRequest>({
    mutationFn: userController.verifyUser,
    onSuccess: async (response) => {
      if (!response.isDone) {
        throw new Error(GLOBAL_CAPTIONS.pages.signup.singupException);
      }
    },
    // onError: (error) => {
    //   const message = handleAuthError(error);
    //   toast.error(message);
    // },
  });
}
