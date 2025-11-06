import { toast } from "sonner";
import { API_BASE_URL } from "../config";
import { ApiError, ProblemDetails } from "../types/network";

export async function apiRequestClient<T>(
  endpoint: string,
  options: RequestInit = {},
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
        errorData,
      );
    }

    return await response.json();
  } catch (error) {
    if (error instanceof ApiError) {
      toast.error(error.problemDetails.detail);
      throw error;
    }

    toast.error("An unexpected error occurred during the request.");
    throw new ApiError(0, "Network Error", {
      title: "Network Error",
      detail:
        error instanceof Error
          ? error.message
          : "An unexpected error occurred during the request.",
    });
  }
}

// Streaming version: returns the Response object for manual streaming handling
export async function apiRequestClientStream(
  endpoint: string,
  options: RequestInit = {},
): Promise<Response> {
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

  return fetch(url, config);
}

export async function apiRequestClientText(
  endpoint: string,
  options: RequestInit = {},
): Promise<string> {
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
        errorData,
      );
    }

    return await response.text();
  } catch (error) {
    if (error instanceof ApiError) {
      toast.error(error.problemDetails.detail);
      throw error;
    }

    toast.error("An unexpected error occurred during the request.");
    throw new ApiError(0, "Network Error", {
      title: "Network Error",
      detail:
        error instanceof Error
          ? error.message
          : "An unexpected error occurred during the request.",
    });
  }
}
