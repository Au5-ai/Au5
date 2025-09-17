"use client";

import HeroSection from "@/views/landing/HeroSection";
import Logo from "@/shared/components/logo";
import { Button } from "@/shared/components/ui";
import { useRouter } from "next/navigation";
import { landingCaptions } from "./i18n";

export default function Home() {
  const router = useRouter();
  function letsGo() {
    router.push("/setup");
  }

  return (
    <div
      className="min-h-screen bg-gradient-to-b from-slate-50 to-white"
      style={{
        background:
          "linear-gradient(to bottom, #f8fbff 0%, #f4f0ec 28%, #f4eae7 66%, #f4e8ec 100%)",
        color: "black",
      }}>
      <nav className="fixed top-0 w-full z-50">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center h-16">
            <Logo text="Au5.ai" className="text-slate-900" />
            <div className="hidden md:flex items-center space-x-8">
              <Button onClick={() => letsGo()} className="cursor-pointer">
                {landingCaptions.navigation.letsGoButton}
              </Button>
            </div>
          </div>
        </div>
      </nav>
      <HeroSection />
    </div>
  );
}
