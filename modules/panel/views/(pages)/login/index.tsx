import { LoginForm } from "./login-form";
import Logo from "@/shared/components/logo";
import Image from "next/image";
import { loginCaptions } from "./i18n";
import { GLOBAL_CAPTIONS } from "@/shared/i18n/captions";

export default function LoginPage() {
  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex justify-center gap-2 md:justify-start">
          <Logo href="#" text={GLOBAL_CAPTIONS.brandName} />
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-xs">
            <LoginForm />
          </div>
        </div>
      </div>
      <div className="relative hidden lg:block bg-gradient flex-col items-center justify-center p-8">
        <div className="flex flex-col items-center justify-center h-full max-w-md text-center">
          <h2 className="text-3xl font-bold mb-8">
            {loginCaptions.welcomeBackTitle}
          </h2>
          <div className="mb-8">
            <Image
              src="/assets/images/hi5.png"
              alt="Welcome illustration"
              width={192}
              height={192}
              className="object-contain"
            />
          </div>
          <p className="text-black-100 text-lg leading-relaxed">
            {loginCaptions.welcomeMessage}
          </p>
        </div>
      </div>
    </div>
  );
}
