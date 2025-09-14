import Image from "next/image";
import { cn } from "@/shared/lib/utils";

interface LogoProps {
  className?: string;
  width?: number;
  height?: number;
  priority?: boolean;
}

export function Logo({
  className,
  width = 128,
  height = 128,
  priority = false,
}: LogoProps) {
  return (
    <div className={cn("flex items-center", className)}>
      <Image
        src="/128x.png"
        alt="Au5 Logo"
        width={width}
        height={height}
        priority={priority}
        className="object-contain rounded"
      />
    </div>
  );
}

export default Logo;
