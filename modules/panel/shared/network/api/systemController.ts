import { SystemConfigs } from "@/shared/types";
import { apiRequestClient } from "../apiRequestClient";
import { API_URLS } from "./urls";

export const systemController = {
  getConfig: (): Promise<SystemConfigs> =>
    apiRequestClient<SystemConfigs>(API_URLS.ORGANIZATION.CONFIG, {
      method: "GET",
    }),

  setConfig: (configs: SystemConfigs): Promise<void> =>
    apiRequestClient<void>(API_URLS.ORGANIZATION.CONFIG, {
      method: "POST",
      body: JSON.stringify(configs),
    }),
};
