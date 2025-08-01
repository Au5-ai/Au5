import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";

interface AppState {
  // UI State
  sidebarOpen: boolean;
  theme: "light" | "dark" | "system";

  // User preferences
  language: string;
  notifications: boolean;

  // Actions
  setSidebarOpen: (open: boolean) => void;
  setTheme: (theme: "light" | "dark" | "system") => void;
  setLanguage: (language: string) => void;
  setNotifications: (enabled: boolean) => void;
}

export const useAppStore = create<AppState>()(
  devtools(
    persist(
      (set) => ({
        // Initial state
        sidebarOpen: true,
        theme: "system",
        language: "en",
        notifications: true,

        // Actions
        setSidebarOpen: (open) => set({ sidebarOpen: open }),
        setTheme: (theme) => set({ theme }),
        setLanguage: (language) => set({ language }),
        setNotifications: (notifications) => set({ notifications }),
      }),
      {
        name: "app-storage",
        partialize: (state) => ({
          theme: state.theme,
          language: state.language,
          notifications: state.notifications,
        }),
      }
    )
  )
);
