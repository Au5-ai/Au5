"use client";

import { AppSidebar } from "@/components/app-sidebar";
import { AuthGuard } from "@/components/auth-guard";
import { LogoutButton } from "@/components/logout-button";
import { useUser } from "@/hooks/use-auth";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { usePathname } from "next/navigation";

interface AuthenticatedLayoutProps {
  children: React.ReactNode;
}

export default function AuthenticatedLayout({
  children,
}: AuthenticatedLayoutProps) {
  const { data: user } = useUser();
  const pathname = usePathname();

  // Generate breadcrumbs based on current path
  const generateBreadcrumbs = () => {
    const segments = pathname.split("/").filter(Boolean);
    const breadcrumbs = [];

    breadcrumbs.push(
      <BreadcrumbItem key="playground" className="hidden md:block">
        <BreadcrumbLink href="/playground">Playground</BreadcrumbLink>
      </BreadcrumbItem>
    );

    // Add current page if not dashboard
    if (
      segments.length > 1 ||
      (segments.length === 1 && segments[0] !== "dashboard")
    ) {
      const currentPage = segments[segments.length - 1];

      // Map route names to display names
      const pageNameMap: { [key: string]: string } = {
        myMeeting: "My Meetings",
        playground: "Playground",
      };

      const pageName =
        pageNameMap[currentPage] ||
        currentPage
          .replace(/([A-Z])/g, " $1")
          .replace(/^./, (str) => str.toUpperCase())
          .trim();

      breadcrumbs.push(
        <BreadcrumbSeparator key="separator" className="hidden md:block" />
      );

      breadcrumbs.push(
        <BreadcrumbItem key={currentPage}>
          <BreadcrumbPage>{pageName}</BreadcrumbPage>
        </BreadcrumbItem>
      );
    }

    return (
      <Breadcrumb>
        <BreadcrumbList>{breadcrumbs}</BreadcrumbList>
      </Breadcrumb>
    );
  };

  return (
    <AuthGuard>
      <SidebarProvider>
        <AppSidebar user={user} />
        <SidebarInset>
          <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
            <div className="flex items-center gap-2 px-4">
              <SidebarTrigger className="-ml-1" />
              <Separator
                orientation="vertical"
                className="mr-2 data-[orientation=vertical]:h-4"
              />
              {generateBreadcrumbs()}
            </div>
            <div className="ml-auto px-4">
              <LogoutButton />
            </div>
          </header>
          <div className="flex flex-1 flex-col">{children}</div>
        </SidebarInset>
      </SidebarProvider>
    </AuthGuard>
  );
}
