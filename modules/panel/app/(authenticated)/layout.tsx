"use client";

import {
  Button,
  Separator,
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/shared/components/ui";
import { AppSidebar } from "@/shared/components/app-sidebar";
import { AuthGuard } from "@/shared/components/auth-guard";
import {
  useCurrentUser,
  useCurrentUserMenu,
  useCurrentUserSpaces,
} from "@/shared/hooks/use-user";
import BreadcrumbLayout from "@/shared/components/breadcrumb-layout";
import { IconBrandGithub } from "@tabler/icons-react";

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
        <SidebarInset>
          <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
            <div className="flex items-center gap-2 px-4">
              <SidebarTrigger className="-ml-1" />
              <Separator
                orientation="vertical"
                className="mr-2 data-[orientation=vertical]:h-4"
              />
              <BreadcrumbLayout />
            </div>
            <div className="ml-auto px-4">
              <Button variant="outline" size="sm">
                <IconBrandGithub /> Github
              </Button>
            </div>
          </header>
          {children}
        </SidebarInset>
      </SidebarProvider>
    </AuthGuard>
  );
}
