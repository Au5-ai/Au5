import { Button } from "@/shared/components/ui";
import { Download } from "lucide-react";
import Image from "next/image";
import { CAPTIONS } from "../i18n";

export function DownloadStep() {
  return (
    <>
      <h2 className="text-xl font-semibold mb-2">
        {CAPTIONS.downloadExtensionTitle}
      </h2>
      <p className="text-muted-foreground mb-6">
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
        <div className="flex justify-between py-6">
          <Button variant="outline" className="cursor-pointer">
            <Download />
            {CAPTIONS.downloadButtonText}
          </Button>
          <Image
            src="/assets/images/meets.svg"
            alt="Download Extension"
            className="rounded-lg cursor-pointer"
            width={100}
            height={100}
            style={{ height: "auto" }}
          />
        </div>
      </div>
    </>
  );
}
