import { Button } from "@/shared/components/ui";
import { ChevronRight, Download } from "lucide-react";
import Image from "next/image";
import { CAPTIONS } from "../../i18n";
import { ROUTES } from "@/shared/routes";

export function DownloadStep({ next }: { next: () => void }) {
  const checkExtension = () => {
    next();
  };

  return (
    <>
      <div>
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
            <Button variant="outline" className="cursor-pointer" asChild>
              <a href={ROUTES.EXTENSION_LINK} download>
                <Download />
                {CAPTIONS.downloadButtonText}
              </a>
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
      </div>

      <div className="flex justify-end">
        <Button onClick={checkExtension}>
          {"I installed the extension"} <ChevronRight />
        </Button>
      </div>
    </>
  );
}
