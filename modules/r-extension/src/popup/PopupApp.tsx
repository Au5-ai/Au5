import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Globe, Settings, HelpCircle, Power } from "lucide-react";

interface TabInfo {
  url: string;
  title: string;
  id?: number;
}

interface StorageData {
  enabled: boolean;
  settings: {
    theme: string;
    notifications: boolean;
  };
}

const PopupApp: React.FC = () => {
  const [tabInfo, setTabInfo] = useState<TabInfo | null>(null);
  const [isEnabled, setIsEnabled] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    // Get current tab info
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]) {
        setTabInfo({
          url: tabs[0].url || "",
          title: tabs[0].title || "",
          id: tabs[0].id,
        });
      }
    });

    // Get extension settings
    chrome.storage.sync.get(["enabled", "settings"], (result: any) => {
      setIsEnabled(result.enabled ?? true);
      setIsLoading(false);
    });
  }, []);

  const toggleExtension = () => {
    const newEnabled = !isEnabled;
    setIsEnabled(newEnabled);

    chrome.storage.sync.set({ enabled: newEnabled }, () => {
      console.log("Extension enabled state updated:", newEnabled);
    });
  };

  const injectContentScript = () => {
    if (tabInfo?.id) {
      chrome.tabs.sendMessage(tabInfo.id, { type: "INJECT_UI" }, (response) => {
        if (chrome.runtime.lastError) {
          console.error("Error injecting UI:", chrome.runtime.lastError);
        } else {
          console.log("UI injected successfully:", response);
        }
      });
    }
  };

  if (isLoading) {
    return (
      <div className="w-80 p-4 flex items-center justify-center">
        <div className="text-sm text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="w-80 bg-background">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-4 text-white">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-semibold">Au5 Extension</h1>
          <Badge
            variant={isEnabled ? "default" : "destructive"}
            className="bg-white/20 text-white border-white/30"
          >
            <Power className="w-3 h-3 mr-1" />
            {isEnabled ? "Enabled" : "Disabled"}
          </Badge>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Current Tab Card */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Globe className="w-4 h-4" />
              Current Tab
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            {tabInfo ? (
              <div className="space-y-2">
                <div>
                  <p className="text-sm font-medium truncate">
                    {tabInfo.title}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {tabInfo.url}
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                No tab information available
              </p>
            )}
          </CardContent>
        </Card>

        {/* Controls Card */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Controls</CardTitle>
          </CardHeader>
          <CardContent className="pt-0 space-y-3">
            <Button
              variant={isEnabled ? "destructive" : "default"}
              className="w-full"
              onClick={toggleExtension}
            >
              <Power className="w-4 h-4 mr-2" />
              {isEnabled ? "Disable Extension" : "Enable Extension"}
            </Button>

            <Button
              variant="outline"
              className="w-full"
              onClick={injectContentScript}
              disabled={!isEnabled}
            >
              Show Extension UI
            </Button>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="flex-1">
            <Settings className="w-4 h-4 mr-1" />
            Settings
          </Button>
          <Button variant="outline" size="sm" className="flex-1">
            <HelpCircle className="w-4 h-4 mr-1" />
            Help
          </Button>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t bg-muted/50 px-4 py-3">
        <p className="text-xs text-center text-muted-foreground">
          Au5 Extension v1.0.0
        </p>
      </div>
    </div>
  );
};

export default PopupApp;
