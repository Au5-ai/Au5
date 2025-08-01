import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";

interface LoginCredentials {
  username: string;
  password: string;
}

interface LoginResponse {
  accessToken?: string;
  message?: string;
  user?: {
    id: string;
    username: string;
    email?: string;
  };
}

interface User {
  id: string;
  username: string;
  email?: string;
}

// API functions
const api = {
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    const response = await fetch("http://localhost:1366/authentication/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || "Failed to login");
    }

    return response.json();
  },

  async getCurrentUser(): Promise<User | null> {
    const token = localStorage.getItem("accessToken");
    if (!token) return null;

    const response = await fetch("http://localhost:1366/authentication/me", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        localStorage.removeItem("accessToken");
      }
      throw new Error("Failed to get user info");
    }

    return response.json();
  },

  async logout(): Promise<void> {
    const token = localStorage.getItem("accessToken");
    if (token) {
      try {
        await fetch("http://localhost:1366/authentication/logout", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
      } catch (error) {
        // Ignore logout endpoint errors
        console.warn("Logout endpoint failed:", error);
      }
    }
    localStorage.removeItem("accessToken");
  },
};

// React Query hooks
export const useLogin = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: api.login,
    onSuccess: (data) => {
      if (data.accessToken) {
        localStorage.setItem("accessToken", data.accessToken);
        if (data.user) {
          queryClient.setQueryData(["currentUser"], data.user);
        }
        queryClient.invalidateQueries({ queryKey: ["currentUser"] });
        navigate("/setup");
      }
    },
    onError: (error) => {
      console.error("Login failed:", error);
      queryClient.setQueryData(["currentUser"], null);
    },
  });
};

export const useCurrentUser = () => {
  return useQuery({
    queryKey: ["currentUser"],
    queryFn: api.getCurrentUser,
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useLogout = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: api.logout,
    onSuccess: () => {
      // Clear all cached data
      queryClient.clear();

      // Redirect to login page
      navigate("/login");
    },
    onError: (error) => {
      console.error("Logout failed:", error);
      // Even if logout fails, clear local data and redirect
      queryClient.clear();
      navigate("/login");
    },
  });
};

// Helper hook to check if user is authenticated
export const useIsAuthenticated = () => {
  const { data: user, isLoading } = useCurrentUser();
  const hasToken = !!localStorage.getItem("accessToken");

  return {
    isAuthenticated: !!user && hasToken,
    isLoading,
    user,
  };
};
