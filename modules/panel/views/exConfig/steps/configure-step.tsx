import { Button } from "@/shared/components/ui";
import { tokenStorageService } from "@/shared/lib/localStorage";
import { userApi } from "@/shared/network/api/user";
import { useQueryClient } from "@tanstack/react-query";
import { Settings } from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";
import { eConfigCaptions } from "../i18n";
import { globalCaptions } from "@/shared/i18n/captions";
import { systemController } from "../systemController";

export function ConfigureStep() {
  const queryClient = useQueryClient();
  const handleSendConfigs = async () => {
    try {
      const [user, systemConfig] = await Promise.all([
        userApi.me(),
        systemController.getExtensionConfig(),
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
        toast.success(eConfigCaptions.configurationSentSuccess);
      }
    } catch (error) {
      console.error(globalCaptions.failedToConfigure, error);
    }
  };

  return (
    <>
      <h2 className="text-xl font-semibold mb-2">
        {eConfigCaptions.configureExtensionTitle}
      </h2>
      <p className="text-muted-foreground mb-6">
        {eConfigCaptions.configureExtensionDescription}
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
            {eConfigCaptions.sendConfigButtonText}
          </Button>
        </div>
      </div>
    </>
  );
}
