import { SystemConfigs } from "@/shared/types";
import { apiRequestClient } from "../apiRequestClient";

export const systemController = {
  getConfig: (): Promise<SystemConfigs> =>
    apiRequestClient<SystemConfigs>("/system/config", {
      method: "GET",
    }),

  setConfig: (configs: SystemConfigs): Promise<void> =>
    apiRequestClient<void>("/system/config", {
      method: "POST",
      body: JSON.stringify(configs),
    }),
};
