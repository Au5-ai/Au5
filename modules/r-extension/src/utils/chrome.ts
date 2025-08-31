// Chrome extension utilities

export interface MessageResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface TabInfo {
  url: string;
  title: string;
  id?: number;
}

export interface ExtensionSettings {
  enabled: boolean;
  theme: "light" | "dark";
  notifications: boolean;
}

// Send message to background script
export function sendMessageToBackground<T = any>(
  message: any
): Promise<MessageResponse<T>> {
  return new Promise((resolve) => {
    chrome.runtime.sendMessage(message, (response: MessageResponse<T>) => {
      if (chrome.runtime.lastError) {
        resolve({
          success: false,
          error: chrome.runtime.lastError.message,
        });
      } else {
        resolve(response || { success: false, error: "No response" });
      }
    });
  });
}

// Send message to content script
export function sendMessageToTab<T = any>(
  tabId: number,
  message: any
): Promise<MessageResponse<T>> {
  return new Promise((resolve) => {
    chrome.tabs.sendMessage(tabId, message, (response: MessageResponse<T>) => {
      if (chrome.runtime.lastError) {
        resolve({
          success: false,
          error: chrome.runtime.lastError.message,
        });
      } else {
        resolve(response || { success: false, error: "No response" });
      }
    });
  });
}

// Get current active tab
export function getCurrentTab(): Promise<chrome.tabs.Tab | null> {
  return new Promise((resolve) => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      resolve(tabs[0] || null);
    });
  });
}

// Storage utilities
export const storage = {
  // Get from storage
  get<T = any>(keys: string | string[]): Promise<T> {
    return new Promise((resolve) => {
      chrome.storage.sync.get(keys, (result) => {
        resolve(result as T);
      });
    });
  },

  // Set to storage
  set(data: Record<string, any>): Promise<void> {
    return new Promise((resolve) => {
      chrome.storage.sync.set(data, () => {
        resolve();
      });
    });
  },

  // Remove from storage
  remove(keys: string | string[]): Promise<void> {
    return new Promise((resolve) => {
      chrome.storage.sync.remove(keys, () => {
        resolve();
      });
    });
  },

  // Clear all storage
  clear(): Promise<void> {
    return new Promise((resolve) => {
      chrome.storage.sync.clear(() => {
        resolve();
      });
    });
  },
};

// URL utilities
export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

export function getDomain(url: string): string {
  try {
    return new URL(url).hostname;
  } catch {
    return "";
  }
}

// Logging utility
export function log(
  level: "info" | "warn" | "error",
  message: string,
  ...args: any[]
) {
  const timestamp = new Date().toISOString();
  const prefix = `[Au5 Extension ${timestamp}]`;

  switch (level) {
    case "info":
      console.log(prefix, message, ...args);
      break;
    case "warn":
      console.warn(prefix, message, ...args);
      break;
    case "error":
      console.error(prefix, message, ...args);
      break;
  }
}
