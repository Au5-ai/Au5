import { apiRequestClient } from "@/shared/network/apiRequestClient";
import { ExtensionConfig } from "./types";
import { API_URLS } from "@/shared/network/api/urls";

export const systemController = {
  getExtensionConfig: (): Promise<ExtensionConfig> =>
    apiRequestClient<ExtensionConfig>(API_URLS.SYSTEM.EXTENSION_CONFIG, {
      method: "GET",
    }),
};
