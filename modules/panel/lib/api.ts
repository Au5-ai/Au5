// API configuration
export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:1366";

// Types for API requests and responses
export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  token_type?: string;
  expires_in?: number;
}

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = "ApiError";
  }
}

// Generic API request function
export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;

  const config: RequestInit = {
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    ...options,
  };

  // Add authorization header if token exists
  const token = localStorage.getItem("access_token");
  if (token) {
    config.headers = {
      ...config.headers,
      Authorization: `Bearer ${token}`,
    };
  }

  try {
    const response = await fetch(url, config);

    if (!response.ok) {
      const errorData = await response
        .json()
        .catch(() => ({ message: "Unknown error" }));
      throw new ApiError(
        response.status,
        errorData.message || `HTTP ${response.status}: ${response.statusText}`
      );
    }

    return await response.json();
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(
      0,
      error instanceof Error ? error.message : "Network error"
    );
  }
}

// Authentication API functions
export const authApi = {
  login: (credentials: LoginRequest): Promise<LoginResponse> =>
    apiRequest<LoginResponse>("/authentication/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    }),

  logout: (): Promise<void> =>
    apiRequest<void>("/auth/logout", {
      method: "POST",
    }),
};

// Token management utilities
export const tokenStorage = {
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
    const token = tokenStorage.get();
    if (!token) return false;

    try {
      // Basic JWT expiration check (optional)
      const payload = JSON.parse(atob(token.split(".")[1]));
      const now = Date.now() / 1000;
      return payload.exp ? payload.exp > now : true;
    } catch {
      return true; // If we can't parse, assume it's valid (let server validate)
    }
  },
};
