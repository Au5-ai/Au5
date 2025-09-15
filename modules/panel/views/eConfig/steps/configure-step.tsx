import { Button } from "@/shared/components/ui";
import { tokenStorageService } from "@/shared/lib/localStorage";
import { systemApi } from "@/shared/network/api/system";
import { userApi } from "@/shared/network/api/user";
import { useQueryClient } from "@tanstack/react-query";
import { Settings } from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";

export function ConfigureStep() {
  const queryClient = useQueryClient();
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
          "*",
        );
        localStorage.setItem("eConfig", "true");
        localStorage.setItem("config", JSON.stringify(config));
        queryClient.setQueryData(["currentUser"], {
          ...user,
        });
        toast.success("Configuration sent to extension!");
      }
    } catch (error) {
      console.error("Failed to configure:", error);
    }
  };

  return (
    <>
      <h2 className="text-xl font-semibold mb-2">Configure Extension</h2>
      <p className="text-muted-foreground mb-6">
        Configure the extension settings
      </p>
      <div>
        <Image
          src="/assets/images/welcome.png"
          alt="Configure Extension"
          className="rounded-lg"
          width={480}
          height={100}
          style={{ height: "auto" }}
        />

        <div className="flex justify-between py-6">
          <Button variant="outline" onClick={handleSendConfigs}>
            <Settings />
            Send Config To Extension
          </Button>
        </div>
      </div>
    </>
  );
}
