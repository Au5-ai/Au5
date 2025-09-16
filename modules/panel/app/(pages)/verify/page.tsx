"use client";

import Logo from "@/shared/components/logo";

// import Logo from "@/shared/components/logo";
// import { setUpApi } from "@/shared/network/api/setup";
// import { useRouter } from "next/navigation";
// import { useEffect, useState } from "react";
// import { SignupForm } from "./signup-form";

export default function SignupPage() {
  //   const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  //   const [isLoading, setIsLoading] = useState(true);
  //   const router = useRouter();

  //   useEffect(() => {
  //     const checkAdminStatus = async () => {
  //       try {
  //         const response = await setUpApi.helloAdmin();
  //         setIsAdmin(response.helloFromAdmin);

  //         if (response.helloFromAdmin) {
  //           router.push("/login");
  //         }
  //       } catch (error) {
  //         console.error("Failed to check admin status:", error);
  //         router.push("/login");
  //       } finally {
  //         setIsLoading(false);
  //       }
  //     };

  //     checkAdminStatus();
  //   }, [router]);

  //   // Show loading state while checking admin status
  //   if (isLoading) {
  //     return (
  //       <div
  //         style={{
  //           background:
  //             "linear-gradient(to bottom, #f8fbff 0%, #f4f0ec 28%, #f4eae7 66%, #f4e8ec 100%)",
  //           color: "black",
  //           display: "flex",
  //         }}
  //         className="bg-muted flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
  //         <div className="min-h-100 w-full flex items-center justify-center">
  //           <div className="text-center">
  //             <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4"></div>
  //             <p className="text-gray-600 font-medium">Loading ...</p>
  //           </div>
  //         </div>
  //       </div>
  //     );
  //   }

  //   if (isAdmin) {
  //     return null;
  //   }

  return (
    <div className="gradiant-bg bg-muted flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <Logo href="#" text="Au5.ai" />
      </div>
    </div>
  );
}
