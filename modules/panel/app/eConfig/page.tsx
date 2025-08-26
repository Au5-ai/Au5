"use client";
import Logo from "@/components/logo";
import EConfigPanel from "./e-config";

export default function OnboardingPage() {
  return (
    <div
      style={{
        background:
          "linear-gradient(to bottom, #f8fbff 0%, #f4f0ec 28%, #f4eae7 66%, #f4e8ec 100%)",
        color: "black",
        display: "flex",
      }}
      className="bg-muted flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10"
    >
      <div className="flex flex-col gap-6">
        <a href="#" className="flex items-center gap-2 font-medium">
          <div className="bg-primary text-primary-foreground flex size-6 items-center justify-center rounded-md">
            <Logo />
          </div>
          Au5.ai
        </a>
        <div className="flex items-center justify-center w-[800px]">
          <EConfigPanel />
        </div>
        <div className="p-2 text-center text-sm items-center justify-center text-muted-foreground">
          if you already configured the extention{" "}
          <a href="#" className="underline underline-offset-4">
            skip here
          </a>
        </div>
      </div>
    </div>
  );
}
