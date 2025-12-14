"use client";

import { useEffect, useState } from "react";

const MESSAGE_SOURCE = "AU5_PANEL";
const EXTENSION_SOURCE = "AU5_EXTENSION";
const CHECK_TIMEOUT = 2000;

export function useExtensionDetection() {
  const [isInstalled, setIsInstalled] = useState<boolean | null>(null);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setIsInstalled(false);
      setIsChecking(false);
    }, CHECK_TIMEOUT);

    const handleMessage = (event: MessageEvent) => {
      console.log("Received message:", event.data);
      if (
        event.source === window &&
        event.data?.source === EXTENSION_SOURCE &&
        event.data?.type === "PING_REPLY" &&
        event.data?.installed
      ) {
        clearTimeout(timeout);
        setIsInstalled(true);
        setIsChecking(false);
        window.removeEventListener("message", handleMessage);
      }
    };

    window.addEventListener("message", handleMessage);

    window.postMessage({ source: MESSAGE_SOURCE, type: "PING_EXTENSION" }, "*");

    return () => {
      clearTimeout(timeout);
      window.removeEventListener("message", handleMessage);
    };
  }, []);

  return { isInstalled, isChecking };
}
