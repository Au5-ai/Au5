"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { SignupForm } from "@/components/signup-form";
import Logo from "@/components/logo";
import { authApi, setUpApi } from "@/lib/api";

export default function SignupPage() {
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkAdminStatus = async () => {
      try {
        const response = await setUpApi.helloAdmin();
        setIsAdmin(response.helloFromAdmin);

        if (response.helloFromAdmin) {
          router.push("/login");
        }
      } catch (error) {
        console.error("Failed to check admin status:", error);
        router.push("/login");
      } finally {
        setIsLoading(false);
      }
    };

    checkAdminStatus();
  }, [router]);

  // Show loading state while checking admin status
  if (isLoading) {
    return (
      <div
        style={{
          background:
            "linear-gradient(to bottom, #f8fbff 0%, #f4f0ec 28%, #f4eae7 66%, #f4e8ec 100%)",
          color: "black",
          display: "flex",
        }}
        className="bg-muted flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10"
      >
        <div className="flex w-full max-w-sm flex-col gap-6">
          <div className="flex justify-center">
            <div className="text-sm text-muted-foreground">Loading...</div>
          </div>
        </div>
      </div>
    );
  }

  if (isAdmin) {
    return null;
  }

  return (
    <div
      style={{
        background:
          "linear-gradient(to bottom, #f8fbff 0%, #f4f0ec 28%, #f4eae7 66%, #f4e8ec 100%)",
        color: "black",
        display: "flex",
      }}
      className="bg-muted flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10"
    >
      <div className="flex w-full max-w-sm flex-col gap-6">
        <a href="#" className="flex items-center gap-2 font-medium">
          <div className="bg-primary text-primary-foreground flex size-6 items-center justify-center rounded-md">
            <Logo />
          </div>
          Au5.ai
        </a>
        <SignupForm />
      </div>
    </div>
  );
}
