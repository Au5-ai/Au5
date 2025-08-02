"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { tokenStorage } from "@/lib/api";

interface AuthGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function AuthGuard({ children, fallback }: AuthGuardProps) {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const checkAuth = () => {
      const isValid = tokenStorage.isValid();
      setIsAuthenticated(isValid);

      if (!isValid) {
        router.push("/login");
      }
    };

    checkAuth();
  }, [router]);

  if (isAuthenticated === null) {
    return fallback || <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return fallback || <div>Redirecting to login...</div>;
  }

  return <>{children}</>;
}
