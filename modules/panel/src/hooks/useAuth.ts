import { LoginCredentials, LoginResponse, OrgConfig, User } from "@/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";

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
  async getCurrentUser(token: string): Promise<User | null> {
    if (!token) return null;

    const response = await fetch("http://localhost:1366/user/me", {
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
  async getConfig(token: string): Promise<OrgConfig> {
    const response = await fetch("http://localhost:1366/org/config", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch config");
    }

    return response.json();
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
        queryClient.invalidateQueries({ queryKey: ["currentUser"] });

        Promise.all([
          api.getCurrentUser(data.accessToken),
          api.getConfig(data.accessToken),
        ]).then(([user, serviceConfig]) => {
          if (user && serviceConfig) {
            const config = {
              user: {
                id: user.id,
                fullName: user.fullname,
                pictureUrl: user.pictureUrl,
                hasAccount: user.hasAccount,
              },
              service: {
                jwtToken: data.accessToken,
                panelUrl: serviceConfig.panelUrl,
                baseUrl: serviceConfig.serviceBaseUrl,
                direction: serviceConfig.direction,
                language: serviceConfig.language,
                hubUrl: serviceConfig.hubUrl,
                companyName: serviceConfig.name,
                botName: serviceConfig.botName,
              },
            };
            localStorage.setItem("au5-config", JSON.stringify(config));
            queryClient.setQueryData(["currentUser"], {
              ...user,
              hasAccount: user.hasAccount,
            });
          }
        });

        navigate("/setup");
      }
    },
    onError: () => {
      queryClient.setQueryData(["currentUser"], null);
    },
  });
};

export const useCurrentUser = () => {
  return useQuery({
    queryKey: ["currentUser"],
    queryFn: api.getCurrentUser,
    retry: false,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

export const useLogout = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: api.logout,
    onSuccess: () => {
      queryClient.clear();
      navigate("/login");
    },
    onError: () => {
      queryClient.clear();
      navigate("/login");
    },
  });
};
