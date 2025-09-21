import { useMutation } from "@tanstack/react-query";
import { AddUserRequest, AddUserResponse } from "./types";
import { userController } from "./userController";

export function useSignup() {
  return useMutation<AddUserResponse, unknown, AddUserRequest>({
    mutationFn: userController.verifyUser,
    onSuccess: async () => {},
    // onError: (error) => {
    //   const message = handleAuthError(error);
    //   toast.error(message);
    // },
  });
}
