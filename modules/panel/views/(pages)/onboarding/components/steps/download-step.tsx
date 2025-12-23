"use client";
import { Button } from "@/shared/components/ui";
import { RefreshCw, Download } from "lucide-react";
import Image from "next/image";
import { CAPTIONS } from "../../i18n";
import { ROUTES } from "@/shared/routes";
import { Checkbox } from "@/shared/components/ui/checkbox";
import { Label } from "@/shared/components/ui/label";
import { useDownloadStep } from "../../hooks";

export function DownloadStep() {
  const { isInstalled, setIsInstalled, handleRefreshAndContinue } =
    useDownloadStep();

  return (
    <>
      <div>
        <h2 className="text-xl font-semibold mb-2">
          {CAPTIONS.downloadExtensionTitle}
        </h2>
        <p className="text-muted-foreground mb-2">
          {CAPTIONS.downloadExtensionDescription}
        </p>
        <div>
          <Image
            src="/assets/images/extension-install.png"
            width={480}
            height={400}
            alt="Welcome"
            className="rounded-lg"
            style={{ height: "auto" }}
          />
          <div className="flex justify-between pt-6">
            <Button variant="outline" className="cursor-pointer" asChild>
              <a href={ROUTES.EXTENSION_LINK} download>
                <Download />
                {CAPTIONS.downloadButtonText}
              </a>
            </Button>
            <Image
              src="/assets/images/browsers.png"
              alt="Download Extension"
              className="rounded-lg cursor-pointer"
              width={80}
              height={36}
            />
          </div>
        </div>
      </div>
      <div className="flex gap-3 flex-col">
        <Label className="hover:bg-accent/50 flex items-start gap-3 rounded-lg border p-3 has-[[aria-checked=true]]:border-blue-600 has-[[aria-checked=true]]:bg-blue-50 dark:has-[[aria-checked=true]]:border-blue-900 dark:has-[[aria-checked=true]]:bg-blue-950">
          <Checkbox
            id="extension-installed"
            checked={isInstalled}
            onCheckedChange={(checked: boolean) =>
              setIsInstalled(checked === true)
            }
          />
          <div className="grid gap-1.5 font-normal">
            <p className="text-sm leading-none font-medium">
              I have installed the extension
            </p>
            <p className="text-muted-foreground text-sm">
              Enable this option to allow send configuration to the extension
            </p>
          </div>
        </Label>

        <div className="flex justify-between items-center">
          <div></div>
          <Button onClick={handleRefreshAndContinue} disabled={!isInstalled}>
            <RefreshCw />
            {CAPTIONS.refreshAndContinueButton}
          </Button>
        </div>
      </div>
    </>
  );
}
