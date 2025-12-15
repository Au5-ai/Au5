"use client";

import HeroSection from "@/views/(pages)/landing/HeroSection";
import Logo from "@/shared/components/logo";
import { Button } from "@/shared/components/ui";
import { useRouter } from "next/navigation";
import { landingCaptions } from "./i18n";
import { ROUTES } from "@/shared/routes";

export default function Home() {
  const router = useRouter();
  function signup() {
    router.push(ROUTES.SIGNUP);
  }

  function login() {
    router.push(ROUTES.LOGIN);
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
            <Logo text="Riter" className="text-slate-900" />
            <div className="flex items-center space-x-2">
              <div className="hidden md:flex items-center space-x-8">
                <Button
                  onClick={() => login()}
                  variant="outline"
                  className="cursor-pointer">
                  {landingCaptions.navigation.login}
                </Button>
              </div>

              <div className="hidden md:flex items-center space-x-8">
                <Button onClick={() => signup()} className="cursor-pointer">
                  {landingCaptions.navigation.signup}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </nav>
      <HeroSection />
    </div>
  );
}
