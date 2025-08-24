import {
  ApiError,
  LoginRequest,
  LoginResponse,
  User,
  ProblemDetails,
  SystemConfigs,
  MeetingData,
  ExtensionConfig,
  HelloAdminResponse,
} from "@/type";

// API configuration
export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:1366";

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
      const errorData: ProblemDetails = await response.json().catch(() => ({
        title: "Unknown Error",
        detail: "An unknown error occurred.",
        status: response.status,
      }));

      throw new ApiError(
        response.status,
        errorData.title || "HTTP Error",
        errorData
      );
    }

    return await response.json();
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }

    throw new ApiError(0, "Network Error", {
      title: "Network Error",
      detail:
        error instanceof Error
          ? error.message
          : "An unexpected error occurred during the request.",
    });
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
    apiRequest<void>("/authentication/logout", {
      method: "POST",
    }),

  helloAdmin: (): Promise<HelloAdminResponse> =>
    apiRequest<HelloAdminResponse>("/authentication/hello-admin", {
      method: "GET",
    }),
};

export const userApi = {
  me: (): Promise<User> =>
    apiRequest<User>("/user/me", {
      method: "GET",
    }),
};

export const systemApi = {
  getExtensionConfig: (): Promise<ExtensionConfig> =>
    apiRequest<ExtensionConfig>("/system/extension-config", {
      method: "GET",
    }),

  getConfig: (): Promise<SystemConfigs> =>
    apiRequest<SystemConfigs>("/system/config", {
      method: "GET",
    }),

  setConfig: (configs: SystemConfigs): Promise<void> =>
    apiRequest<void>("/system/config", {
      method: "POST",
      body: JSON.stringify(configs),
    }),
};

export const meetingApi = {
  my: (): Promise<MeetingData> => {
    return apiRequest<MeetingData>("/meeting/my", {
      method: "GET",
    });
  },
  archived: (): Promise<MeetingData> => {
    return apiRequest<MeetingData>("/meeting/archived", {
      method: "GET",
    });
  },
};
