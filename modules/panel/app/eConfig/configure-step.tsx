import { Button } from "@/components/ui/button";
import { systemApi, userApi } from "@/lib/api";
import { tokenStorageService } from "@/lib/services";
import { QueryClient } from "@tanstack/react-query";
import { Settings } from "lucide-react";
import Image from "next/image";

export function ConfigureStep() {
  const handleSendConfigs = async () => {
    try {
      const [user, systemConfig] = await Promise.all([
        userApi.me(),
        systemApi.getExtensionConfig(),
      ]);

      if (user && systemConfig) {
        const config = {
          user: {
            id: user.id,
            fullName: user.fullName,
            pictureUrl: user.pictureUrl,
            hasAccount: user.hasAccount,
          },
          service: {
            jwtToken: tokenStorageService.get(),
            panelUrl: systemConfig.panelUrl,
            baseUrl: systemConfig.serviceBaseUrl,
            direction: systemConfig.direction,
            language: systemConfig.language,
            hubUrl: systemConfig.hubUrl,
            companyName: systemConfig.organizationName,
            botName: systemConfig.botName,
          },
        };

        window.postMessage(
          {
            source: "AU5_PANEL",
            type: "CONFIG_UPDATE",
            payload: config,
          },
          "*"
        );
        localStorage.setItem("eConfig", "true");
        localStorage.setItem("config", JSON.stringify(config));
        ueryClient.setQueryData(["currentUser"], {
          ...user,
          hasAccount: user.hasAccount,
        });
      }
    } catch (error) {
      console.error("Failed to configure:", error);
    } finally {
      setIsConfiguring(false);
    }
  };

  return (
    <div>
      <Image
        src="/welcome.png"
        alt="Configure Extension"
        className="rounded-lg"
        width={480}
        height={100}
        style={{ height: "auto" }}
      />

      <div className="flex justify-between py-6">
        <Button variant="outline" className="cursor-pointer">
          <Settings />
          Send Config To Extension
        </Button>
      </div>
    </div>
  );
}
