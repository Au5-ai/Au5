import { GalleryVerticalEnd } from "lucide-react";

import { LoginForm } from "@/components/login-form";

export default function LoginPage() {
  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex justify-center gap-2 md:justify-start">
          <a href="#" className="flex items-center gap-2 font-medium">
            <div className="bg-primary text-primary-foreground flex size-6 items-center justify-center rounded-md">
              <GalleryVerticalEnd className="size-4" />
            </div>
            Au5 Inc.
          </a>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-xs">
            <LoginForm />
          </div>
        </div>
      </div>
      <div
        className="relative hidden lg:block flex flex-col items-center justify-center p-8"
        style={{
          background:
            "linear-gradient(to bottom, #f8fbff 0%, #f4f0ec 28%, #f4eae7 66%, #f4e8ec 100%)",
          color: "black",
          display: "flex",
        }}
      >
        <div className="flex flex-col items-center justify-center h-full max-w-md text-center">
          <h2 className="text-3xl font-bold mb-8">Welcome Back</h2>
          <div className="mb-8">
            <img
              src="/hi5.png"
              alt="Welcome illustration"
              className="w-48 h-48 object-contain"
            />
          </div>
          <p className="text-black-100 text-lg leading-relaxed">
            Empower your meetings with real-time transcription, smart
            automation, and seamless integrations.
          </p>
        </div>
      </div>
    </div>
  );
}
