"use client";

import {
  Separator,
  SidebarInset,
  SidebarTrigger,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/shared/components/ui";
import BreadcrumbLayout from "@/shared/components/breadcrumb-layout";
import { Bot, Settings, Target } from "lucide-react";
import { SystemConfigsTab } from "./components/system-config";
import { SYSTEM_CAPTIONS } from "./i18n";

export default function SystemConfigPage() {
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
      <div className="flex flex-1 flex-col px-6 py-4">
        <div className="container mx-auto mb-4">
          <h1 className="text-2xl font-bold mb-1">{SYSTEM_CAPTIONS.title}</h1>
          <p className="text-muted-foreground">
            {SYSTEM_CAPTIONS.description}
          </p>
        </div>
        <Tabs defaultValue="SystemConfigsTab" className="w-full">
          <div className="bg-muted rounded-lg">
            <TabsList>
              <TabsTrigger value="SystemConfigsTab">
                <Settings className="mr-1 h-4 w-4" /> {SYSTEM_CAPTIONS.tabs.systemConfiguration}
              </TabsTrigger>
              <TabsTrigger value="Reactions">
                <Target className="mr-1 h-4 w-4" /> {SYSTEM_CAPTIONS.tabs.reactions}
              </TabsTrigger>
              <TabsTrigger value="AutoCorrection">
                <Bot className="mr-1 h-4 w-4" /> {SYSTEM_CAPTIONS.tabs.autoCorrection}
              </TabsTrigger>
              {/* <TabsTrigger value="Spaces"> // Commented out - no API for spaces
                <Frame className="mr-1 h-4 w-4" /> Manage Spaces
              </TabsTrigger> */}
            </TabsList>
          </div>
          <TabsContent value="SystemConfigsTab">
            <SystemConfigsTab />
          </TabsContent>
          <TabsContent value="Reactions">
            {SYSTEM_CAPTIONS.tabsContent.reactions}
          </TabsContent>
          <TabsContent value="AutoCorrection">
            {SYSTEM_CAPTIONS.tabsContent.autoCorrection}
          </TabsContent>
          {/* <TabsContent value="Spaces">Manage your spaces here.</TabsContent> */}{" "}
          {/* Commented out - no API for spaces */}
        </Tabs>
      </div>
    </SidebarInset>
  );
}
