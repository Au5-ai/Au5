export const tokenStorageService = {
  set: (token: string) => {
    localStorage.setItem("access_token", token);
  },

  get: (): string | null => {
    return localStorage.getItem("access_token");
  },

  remove: () => {
    localStorage.removeItem("access_token");
  },

  isValid: (): boolean => {
    const token = tokenStorageService.get();
    if (!token) return false;

    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      const now = Date.now() / 1000;
      return payload.exp ? payload.exp > now : true;
    } catch {
      return true;
    }
  },
};
