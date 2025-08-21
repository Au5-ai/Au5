"use client";

import { AppSidebar } from "@/components/app-sidebar";
import { AuthGuard } from "@/components/auth-guard";
import { useUser } from "@/hooks/use-auth";
import { SidebarProvider } from "@/components/ui/sidebar";

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
