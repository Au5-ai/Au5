import { ExtensionConfig, SystemConfigs } from "@/type";
import { apiRequest } from "./client";

export const systemApi = {
  getExtensionConfig: (): Promise<ExtensionConfig> =>
    apiRequest<ExtensionConfig>("/system/extension-config", {
      method: "GET",
    }),

  getConfig: (): Promise<SystemConfigs> =>
    apiRequest<SystemConfigs>("/system/config", {
      method: "GET",
    }),

  setConfig: (configs: SystemConfigs): Promise<void> =>
    apiRequest<void>("/system/config", {
      method: "POST",
      body: JSON.stringify(configs),
    }),
};
