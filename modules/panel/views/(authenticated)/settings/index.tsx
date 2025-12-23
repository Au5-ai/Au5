"use client";

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/shared/components/ui";
import { Bot, Settings, Target } from "lucide-react";
import { SystemConfigsTab } from "./components/system-config";
import { SYSTEM_CAPTIONS } from "./i18n";

export default function SystemConfigPage() {
  return (
    <div className="flex flex-1 flex-col px-6 py-4">
      <div className="container mx-auto mb-4">
        <h1 className="text-2xl font-bold mb-1">{SYSTEM_CAPTIONS.title}</h1>
        <p className="text-muted-foreground">{SYSTEM_CAPTIONS.description}</p>
      </div>
      <Tabs defaultValue="SystemConfigsTab" className="w-full">
        <div className="bg-muted rounded-lg">
          <TabsList>
            <TabsTrigger value="SystemConfigsTab">
              <Settings className="mr-1 h-4 w-4" />{" "}
              {SYSTEM_CAPTIONS.tabs.configuration}
            </TabsTrigger>
            <TabsTrigger value="Reactions">
              <Target className="mr-1 h-4 w-4" />{" "}
              {SYSTEM_CAPTIONS.tabs.reactions}
            </TabsTrigger>
            <TabsTrigger value="AutoCorrection">
              <Bot className="mr-1 h-4 w-4" />{" "}
              {SYSTEM_CAPTIONS.tabs.autoCorrection}
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
  );
}
