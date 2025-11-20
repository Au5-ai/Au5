import { apiRequestClient } from "@/shared/network/apiRequestClient";
import { ExtensionConfig } from "../types";
import { API_URLS } from "@/shared/network/api/urls";

export const organizationsController = {
  getExtensionConfig: (): Promise<ExtensionConfig> =>
    apiRequestClient<ExtensionConfig>(API_URLS.ORGANIZATION.EXTENSION_CONFIG, {
      method: "GET",
    }),
};
