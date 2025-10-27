import React from "react";
import Image from "next/image";

interface PlatformLogoProps {
  platform: string;
}

const PLATFORM_LOGOS: Record<string, string> = {
  googlemeet: "/assets/images/googleMeets.svg",
  teams: "/assets/images/meets.svg",
};

const DEFAULT_LOGO = "/assets/images/meets.svg";

export function PlatformLogo({ platform }: PlatformLogoProps) {
  const logoSrc =
    PLATFORM_LOGOS[platform.replace(" ", "").toLowerCase()] || DEFAULT_LOGO;

  return (
    <Image src={logoSrc} alt={`${platform} Logo`} width={40} height={40} />
  );
}
