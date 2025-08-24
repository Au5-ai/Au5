"use client";

import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import BreadcrumbLayout from "@/components/breadcrumb-layout";
import { Separator } from "@/components/ui/separator";
import { SystemConfigsTab } from "./system-config";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Settings, Target } from "lucide-react";

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
      <div className="flex flex-1 flex-col p-4">
        <div className="container mx-auto mb-4">
          <h1 className="text-2xl font-bold mb-1">System Settings</h1>
          <p className="text-muted-foreground">
            Configure your bot and meeting system parameters
          </p>
        </div>
        <Tabs defaultValue="SystemConfigsTab" className="w-full">
          <TabsList>
            <TabsTrigger value="SystemConfigsTab">
              <Settings className="mr-1 h-4 w-4" /> System Configuration
            </TabsTrigger>
            <TabsTrigger value="Reactions">
              <Target className="mr-1 h-4 w-4" /> Reactions
            </TabsTrigger>
          </TabsList>
          <TabsContent value="SystemConfigsTab">
            <SystemConfigsTab />
          </TabsContent>
          <TabsContent value="Reactions">
            Manage your reactions here.
          </TabsContent>
        </Tabs>
      </div>
    </SidebarInset>
  );
}
