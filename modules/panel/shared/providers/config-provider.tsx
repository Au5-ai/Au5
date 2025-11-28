"use client";

import { useEffect } from "react";
import { setRuntimeApiBaseUrl } from "../network/apiRequestClient";

export function ConfigProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Fetch runtime config on app initialization
    fetch("/api/config")
      .then((res) => res.json())
      .then((config) => {
        if (config.apiBaseUrl) {
          setRuntimeApiBaseUrl(config.apiBaseUrl);
          console.log("Runtime API Base URL set to:", config.apiBaseUrl);
        }
      })
      .catch((error) => {
        console.error("Failed to load runtime config:", error);
      });
  }, []);

  return <>{children}</>;
}
