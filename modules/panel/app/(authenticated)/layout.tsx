"use client";

import { SidebarProvider } from "@/shared/components/ui";
import { AppSidebar } from "@/shared/components/x/app-sidebar";
import { AuthGuard } from "@/shared/components/x/auth-guard";
import { useUser } from "@/shared/hooks/use-auth";

interface AuthenticatedLayoutProps {
  children: React.ReactNode;
}

export default function AuthenticatedLayout({
  children,
}: AuthenticatedLayoutProps) {
  const { data: user } = useUser();
  return (
    <AuthGuard>
      <SidebarProvider>
        <AppSidebar user={user} />
        {children}
      </SidebarProvider>
    </AuthGuard>
  );
}
