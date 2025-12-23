const ACCESS_TOKEN_KEY: string = "access_token";

export class TokenManager {
  async getToken(): Promise<string | null> {
    try {
      return await new Promise<string | null>((resolve, reject) => {
        chrome.storage.local.get(ACCESS_TOKEN_KEY, result => {
          const token = result[ACCESS_TOKEN_KEY];
          resolve(token || null);
        });
      });
    } catch (error) {
      console.error("Error retrieving token:", error);
      return null;
    }
  }

  async setToken(token: string): Promise<void> {
    try {
      await new Promise<void>((resolve, reject) => {
        chrome.storage.local.set({[ACCESS_TOKEN_KEY]: token}, () => {
          if (chrome.runtime.lastError) {
            reject(chrome.runtime.lastError);
          } else {
            resolve();
          }
        });
      });
    } catch (error) {
      console.error("Error saving token:", error);
      throw error;
    }
  }

  async removeToken(): Promise<void> {
    try {
      await new Promise<void>((resolve, reject) => {
        chrome.storage.local.remove(ACCESS_TOKEN_KEY, () => {
          if (chrome.runtime.lastError) {
            reject(chrome.runtime.lastError);
          } else {
            resolve();
          }
        });
      });
    } catch (error) {
      console.error("Error removing token:", error);
      throw error;
    }
  }
}
