import { Button } from "@/shared/components/ui";
import { tokenStorageService } from "@/shared/lib/localStorage";
import { userController } from "@/shared/network/api/userController";
import { useQueryClient } from "@tanstack/react-query";
import { ChevronLeft, Settings } from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";
import { CAPTIONS } from "../i18n";
import { GLOBAL_CAPTIONS } from "@/shared/i18n/captions";
import { systemController } from "../systemController";

export function ConfigureStep({ next }: { next: () => void }) {
  const queryClient = useQueryClient();
  const handleSendConfigs = async () => {
    try {
      const [user, systemConfig] = await Promise.all([
        userController.me(),
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
            panelUrl: systemConfig.panelUrl,
            baseUrl: systemConfig.serviceBaseUrl,
            direction: systemConfig.direction,
            language: systemConfig.language,
            hubUrl: systemConfig.hubUrl,
            companyName: systemConfig.organizationName,
            botName: systemConfig.botName,
          },
        };

        const token = tokenStorageService.get();

        window.postMessage(
          {
            source: "AU5_PANEL",
            type: "CONFIG_UPDATE",
            payload: config,
          },
          "*",
        );

        if (token) {
          window.postMessage(
            {
              source: "AU5_PANEL",
              type: "TOKEN_UPDATE",
              payload: token,
            },
            "*",
          );
        }

        localStorage.setItem("exConfig", "true");
        localStorage.setItem("config", JSON.stringify(config));
        queryClient.setQueryData(["currentUser"], {
          ...user,
        });
        toast.success(CAPTIONS.configurationSentSuccess);
        next();
      }
    } catch (error) {
      console.error(GLOBAL_CAPTIONS.errors.exConfig.failedToConfigure, error);
    }
  };

  return (
    <>
      <div>
        <h2 className="text-xl font-semibold mb-2">
          {CAPTIONS.configureExtensionTitle}
        </h2>
        <p className="text-muted-foreground mb-6">
          {CAPTIONS.configureExtensionDescription}
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
        </div>
      </div>
      <div className="flex justify-between">
        <Button variant="outline" disabled>
          <ChevronLeft />
          {GLOBAL_CAPTIONS.back}
        </Button>

        <Button onClick={handleSendConfigs}>
          <Settings />
          {CAPTIONS.sendConfigButtonText}
        </Button>
      </div>
    </>
  );
}
