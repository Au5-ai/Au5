import { apiRequestClient } from "@/shared/network/apiRequestClient";
import { ExtensionConfig } from "./types";

export const systemController = {
  getExtensionConfig: (): Promise<ExtensionConfig> =>
    apiRequestClient<ExtensionConfig>("/system/extension-config", {
      method: "GET",
    }),
};
