import { AddAdminRequest, AddAdminResponse, HelloAdminResponse } from "@/type";
import { apiRequest } from "./client";

export const setUpApi = {
  helloAdmin: (): Promise<HelloAdminResponse> =>
    apiRequest<HelloAdminResponse>("/setUp/hello-admin", {
      method: "GET",
    }),
  addAdmin: (data: AddAdminRequest): Promise<AddAdminResponse> =>
    apiRequest<AddAdminResponse>("/setUp/hello-admin", {
      method: "POST",
      body: JSON.stringify(data),
    }),
};
