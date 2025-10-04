import { cn } from "@/shared/lib/utils";
import Image from "next/image";

interface LogoProps {
  className?: string;
  width?: number;
  height?: number;
  priority?: boolean;
  href?: string;
  text?: string;
  noBackground?: boolean;
}

export function Logo({
  className,
  width = 128,
  height = 128,
  priority = false,
  href,
  text,
  noBackground = false,
}: LogoProps) {
  const logoContent = (
    <>
      <div className={cn(
        "flex items-center justify-center",
        noBackground ? "" : "bg-primary text-primary-foreground size-6 rounded-md"
      )}>
        <Image
          src="/assets/icons/128x.png"
          alt="Au5 Logo"
          width={width}
          height={height}
          priority={priority}
          className="object-contain rounded"
        />
      </div>
      {text && <span className="text-xl font-bold">{text}</span>}
    </>
  );

  if (href) {
    return (
      <a href={href} className={cn("flex items-center gap-2 font-medium", className)}>
        {logoContent}
      </a>
    );
  }

  return (
    <div className={cn("flex items-center gap-2", className)}>
      {logoContent}
    </div>
  );
}

export default Logo;
