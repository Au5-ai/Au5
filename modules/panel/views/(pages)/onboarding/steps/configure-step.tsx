import { Button } from "@/shared/components/ui";
import { tokenStorageService } from "@/shared/lib/localStorage";
import { ChevronLeft, Settings } from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";
import { CAPTIONS } from "../i18n";
import { GLOBAL_CAPTIONS } from "@/shared/i18n/captions";
import { organizationsController } from "../organizationsController";

export function ConfigureStep({ next }: { next: () => void }) {
  const handleSendConfigs = async () => {
    try {
      const extensionConfig =
        await organizationsController.getExtensionConfig();

      if (extensionConfig) {
        const token = tokenStorageService.get();

        window.postMessage(
          {
            source: "AU5_PANEL",
            type: "CONFIG_UPDATE",
            payload: extensionConfig,
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
