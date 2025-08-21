"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import HeroSection from "@/components/landing/HeroSection";
import { GalleryVerticalEnd, Mic } from "lucide-react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  function signIn() {
    router.push("/login");
  }

  return (
    <div
      className="min-h-screen bg-gradient-to-b from-slate-50 to-white"
      style={{
        background:
          "linear-gradient(to bottom, #f8fbff 0%, #f4f0ec 28%, #f4eae7 66%, #f4e8ec 100%)",
        color: "black",
      }}
    >
      <nav className="fixed top-0 w-full z-50">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <GalleryVerticalEnd className="size-4" />
              <span className="text-xl font-bold text-slate-900">Au5.ai</span>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <Button onClick={() => signIn()} className="cursor-pointer">
                Login
              </Button>
            </div>
          </div>
        </div>
      </nav>
      <HeroSection />
    </div>
  );
}
