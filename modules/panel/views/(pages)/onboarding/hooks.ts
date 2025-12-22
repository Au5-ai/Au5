import { useMutation } from "@tanstack/react-query";
import { AddUserRequest, AddUserResponse } from "./types";
import { userController } from "./controllers/userController";

export function useSignup() {
  return useMutation<AddUserResponse, unknown, AddUserRequest>({
    mutationFn: userController.verifyUser,
    onSuccess: async () => {},
  });
}
