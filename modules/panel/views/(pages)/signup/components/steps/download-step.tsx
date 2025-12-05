import { Button } from "@/shared/components/ui";
import { ChevronRight, Download } from "lucide-react";
import Image from "next/image";
import { CAPTIONS } from "../../i18n";
import { useState } from "react";
import { toast } from "sonner";

const MESSAGE_SOURCE = "AU5_PANEL";
const EXTENSION_SOURCE = "AU5_EXTENSION";

export function DownloadStep({ next }: { next: () => void }) {
  const [checking, setChecking] = useState(false);

  const checkExtension = () => {
    setChecking(true);

    const timeout = setTimeout(() => {
      toast.error("Extension is not installed. Please install it first.");
      setChecking(false);
    }, 2000);

    const handleMessage = (event: MessageEvent) => {
      if (
        event.source === window &&
        event.data?.source === EXTENSION_SOURCE &&
        event.data?.type === "PING_REPLY" &&
        event.data?.installed
      ) {
        clearTimeout(timeout);
        setChecking(false);
        window.removeEventListener("message", handleMessage);
        next();
      }
    };

    window.addEventListener("message", handleMessage);

    window.postMessage({ source: MESSAGE_SOURCE, type: "PING_EXTENSION" }, "*");
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
              <a href="/dl/extension.rar" download>
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
        <Button onClick={checkExtension} disabled={checking}>
          {checking ? "Checking..." : "I installed the extension"}{" "}
          <ChevronRight />
        </Button>
      </div>
    </>
  );
}
