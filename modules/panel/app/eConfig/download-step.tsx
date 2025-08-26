import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import Image from "next/image";

export function DownloadStep() {
  return (
    <div>
      <Image
        src="/extension-install.png"
        width={480}
        height={400}
        alt="Welcome"
        className="rounded-lg"
        style={{ height: "auto" }}
      />
      <div className="flex justify-between py-6">
        <Button variant="outline" className="cursor-pointer">
          <Download />
          Add to Chrome - It's free!
        </Button>
        <Image
          src="/meets.svg"
          alt="Download Extension"
          className="rounded-lg cursor-pointer"
          width={100}
          height={100}
          style={{ height: "auto" }}
        />
      </div>
    </div>
  );
}
