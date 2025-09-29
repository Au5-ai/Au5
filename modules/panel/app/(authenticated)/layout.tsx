"use client";

import { SidebarProvider } from "@/shared/components/ui";
import { AppSidebar } from "@/shared/components/app-sidebar";
import { AuthGuard } from "@/shared/components/auth-guard";
import { useCurrentUser, useCurrentUserMenu } from "@/shared/hooks/user-user";

interface AuthenticatedLayoutProps {
  children: React.ReactNode;
}

export default function AuthenticatedLayout({
  children,
}: AuthenticatedLayoutProps) {
  const { data: user } = useCurrentUser();
  const { data: menu } = useCurrentUserMenu();
  return (
    <AuthGuard>
      <SidebarProvider>
        <AppSidebar user={user} menu={menu} />
        {children}
      </SidebarProvider>
    </AuthGuard>
  );
}
