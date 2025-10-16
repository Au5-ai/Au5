"use client";

import { SidebarProvider } from "@/shared/components/ui";
import { AppSidebar } from "@/shared/components/app-sidebar";
import { AuthGuard } from "@/shared/components/auth-guard";
import {
  useCurrentUser,
  useCurrentUserMenu,
  useCurrentUserSpaces,
} from "@/shared/hooks/use-user";

interface AuthenticatedLayoutProps {
  children: React.ReactNode;
}

export default function AuthenticatedLayout({
  children,
}: AuthenticatedLayoutProps) {
  const { data: user } = useCurrentUser();
  const { data: menu } = useCurrentUserMenu();
  const { data: spaces } = useCurrentUserSpaces();
  return (
    <AuthGuard>
      <SidebarProvider>
        <AppSidebar user={user} menu={menu} spaces={spaces} />
        {children}
      </SidebarProvider>
    </AuthGuard>
  );
}
