import { Button, Label } from "@/shared/components/ui";
import { Puzzle, Settings } from "lucide-react";
import Image from "next/image";
import { CAPTIONS } from "../../i18n";
import { useConfigureStep } from "../../hooks";

export function ConfigureStep({ next }: { next: () => void }) {
  const { handleSendConfigs } = useConfigureStep(next);

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
            src="/assets/images/config.png"
            alt="Configure Extension"
            className="rounded-lg"
            width={485}
            height={400}
            style={{ height: "auto" }}
          />
        </div>

        <Label className="mt-4 hover:bg-accent/50 flex items-start gap-3 rounded-lg border p-3  border-blue-400 ">
          <div className="grid gap-1.5 font-normal">
            <p className="text-sm leading-none font-medium">
              <Puzzle className="inline-block mr-2 mb-1" />
              Here, we will send the configuration to the extension.
            </p>
            <p className="text-muted-foreground text-sm">
              Make sure the extension is installed and running in your browser.
            </p>
          </div>
        </Label>
      </div>
      <div className="flex justify-between">
        <div></div>
        <Button onClick={handleSendConfigs}>
          <Settings />
          {CAPTIONS.sendConfigButtonText}
        </Button>
      </div>
    </>
  );
}
