import { ExtensionConfig, SystemConfigs } from "@/shared/types";
import { apiRequestClient } from "../apiRequestClient";

export const systemApi = {
  getExtensionConfig: (): Promise<ExtensionConfig> =>
    apiRequestClient<ExtensionConfig>("/system/extension-config", {
      method: "GET",
    }),

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
