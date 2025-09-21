export const tokenStorageService = {
  set: (token: string) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("access_token", token);
    }
  },

  get: (): string | null => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("access_token");
    }
    return null;
  },

  remove: () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("access_token");
    }
  },

  isValid: (): boolean => {
    const token = tokenStorageService.get();
    if (!token) return false;

    try {
      const payload = JSON.parse(
        typeof window !== "undefined" ? atob(token.split(".")[1]) : "{}",
      );
      const now = Date.now() / 1000;
      return payload.exp ? payload.exp > now : true;
    } catch {
      return true;
    }
  },
};
