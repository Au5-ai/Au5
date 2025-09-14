import {
  Card,
  CardContent,
  SidebarInset,
  SidebarTrigger,
} from "@/shared/components/ui";
import BreadcrumbLayout from "@/shared/components/x/breadcrumb-layout";
import { Separator } from "@radix-ui/react-separator";

export function MeetingListSkeleton() {
  return (
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
          {/* Render a component passed from children via a prop */}
        </div>
      </header>
      <div className="flex flex-1 flex-col">
        <div className="container mx-auto p-2 px-4">
          <h1 className="text-2xl font-bold mb-1">Meeting Transcription</h1>
        </div>
        {/* Skeleton for date group header */}
        <div className="animate-pulse">
          <div className="h-9 bg-gray-200 px-8 py-3 mb-0">
            <div className="h-4 bg-gray-300 rounded w-24"></div>
          </div>
        </div>

        {/* Skeleton for meeting cards */}
        <Card className="divide-y shadow-none border-none p-0">
          {[...Array(3)].map((_, index) => (
            <CardContent
              key={index}
              className="flex items-center justify-between px-3 py-3 animate-pulse">
              <div className="flex items-center">
                {/* Time and duration skeleton */}
                <div className="flex h-full w-16 min-w-16 max-w-16 flex-col-reverse items-start justify-between truncate pl-1">
                  <div className="h-3 bg-gray-300 rounded w-8"></div>
                  <div className="h-4 bg-gray-300 rounded w-10 mb-2"></div>
                </div>

                {/* Avatar skeleton */}
                <div className="h-10 w-10 bg-gray-300 rounded-full"></div>

                {/* Meeting info skeleton */}
                <div className="ml-3">
                  <div className="h-4 bg-gray-300 rounded w-32 mb-2"></div>
                  <div className="h-3 bg-gray-300 rounded w-24"></div>
                </div>
              </div>

              {/* Action buttons skeleton */}
              <div className="flex items-center gap-3">
                <div className="flex gap-2">
                  <div className="h-8 w-8 bg-gray-300 rounded"></div>
                  <div className="h-8 w-8 bg-gray-300 rounded"></div>
                  <div className="h-8 w-8 bg-gray-300 rounded"></div>
                </div>
              </div>
            </CardContent>
          ))}
        </Card>

        {/* Second skeleton group */}
        <div className="animate-pulse">
          <div className="h-9 bg-gray-200 px-8 py-3 mb-0">
            <div className="h-4 bg-gray-300 rounded w-24"></div>
          </div>
        </div>

        <Card className="divide-y shadow-none border-none p-0">
          {[...Array(3)].map((_, index) => (
            <CardContent
              key={index}
              className="flex items-center justify-between px-3 py-3 animate-pulse">
              <div className="flex items-center">
                {/* Time and duration skeleton */}
                <div className="flex h-full w-16 min-w-16 max-w-16 flex-col-reverse items-start justify-between truncate pl-1">
                  <div className="h-3 bg-gray-300 rounded w-8"></div>
                  <div className="h-4 bg-gray-300 rounded w-10 mb-2"></div>
                </div>

                {/* Avatar skeleton */}
                <div className="h-10 w-10 bg-gray-300 rounded-full"></div>

                {/* Meeting info skeleton */}
                <div className="ml-3">
                  <div className="h-4 bg-gray-300 rounded w-32 mb-2"></div>
                  <div className="h-3 bg-gray-300 rounded w-24"></div>
                </div>
              </div>

              {/* Action buttons skeleton */}
              <div className="flex items-center gap-3">
                <div className="flex gap-2">
                  <div className="h-8 w-8 bg-gray-300 rounded"></div>
                  <div className="h-8 w-8 bg-gray-300 rounded"></div>
                  <div className="h-8 w-8 bg-gray-300 rounded"></div>
                </div>
              </div>
            </CardContent>
          ))}
        </Card>
      </div>
    </SidebarInset>
  );
}
