"use client";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/shared/components/ui/breadcrumb";
import { usePathname } from "next/navigation";

export default function BreadcrumbLayout() {
  const pathname = usePathname();

  // Generate breadcrumbs based on current path
  const generateBreadcrumbs = () => {
    const segments = pathname.split("/").filter(Boolean);
    const breadcrumbs = [];

    breadcrumbs.push(
      <BreadcrumbItem key="playground" className="hidden md:block">
        <BreadcrumbLink href="/playground">Playground</BreadcrumbLink>
      </BreadcrumbItem>,
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
        <BreadcrumbSeparator key="separator" className="hidden md:block" />,
      );

      breadcrumbs.push(
        <BreadcrumbItem key={currentPage}>
          <BreadcrumbPage>{pageName}</BreadcrumbPage>
        </BreadcrumbItem>,
      );
    }

    return (
      <Breadcrumb>
        <BreadcrumbList>{breadcrumbs}</BreadcrumbList>
      </Breadcrumb>
    );
  };

  return <>{generateBreadcrumbs()}</>;
}
