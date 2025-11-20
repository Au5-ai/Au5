"use client";
import Logo from "@/shared/components/logo";
import { Card, CardContent } from "@/shared/components/ui";
import { CheckCircle2, Circle } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { CAPTIONS } from "../i18n";
import { GLOBAL_CAPTIONS } from "@/shared/i18n/captions";
import { LoadingPage } from "@/shared/components/loading-page";
import { userController } from "../controllers/userController";
import { ConfigureStep } from "./steps/configure-step";
import { CompleteStep } from "./steps/complete-step";
import { DownloadStep } from "./steps/download-step";
import { AddUserStep } from "./steps/addUser-step";

export default function OnboardingClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<"loading" | "ok" | "error">("loading");
  const [email, setEmail] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState(1);

  useEffect(() => {
    const userId = searchParams.get("id");
    const hash = searchParams.get("hash");
    if (!userId || !hash) {
      router.push("/403");
      return;
    }
    const verify = async () => {
      try {
        const response = await userController.verify(userId, hash);
        if (response) {
          setStatus("ok");
          setEmail(response.email);
        } else {
          router.push("/403");
        }
      } catch {
        router.push("/403");
      }
    };
    verify();
  }, [searchParams, router]);

  const nextStep = () => {
    if (currentStep < 4) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const Steps = [
    {
      id: 1,
      title: CAPTIONS.addUserTitle,
      description: CAPTIONS.addUserDescription,
      component: <AddUserStep email={email} next={nextStep} />,
    },
    {
      id: 2,
      title: CAPTIONS.downloadExtensionTitle,
      description: CAPTIONS.downloadExtensionDescription,
      component: <DownloadStep next={nextStep} />,
    },
    {
      id: 3,
      title: CAPTIONS.configureExtensionTitle,
      description: CAPTIONS.configureExtensionDescription,
      component: <ConfigureStep next={nextStep} />,
    },
    {
      id: 4,
      title: CAPTIONS.completeSetupTitle,
      description: CAPTIONS.completeSetupDescription,
      component: <CompleteStep />,
    },
  ];

  if (status === "loading") {
    return <LoadingPage />;
  }

  if (status === "ok") {
    return (
      <div className="bg-gradient bg-muted flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
        <div className="flex flex-col gap-6">
          <Logo href="#" text={GLOBAL_CAPTIONS.brandName} />
          <div className="flex items-center justify-center w-[800px]">
            <div className="flex rounded-xl border shadow-sm w-full h-[600px] gap-2 bg-card text-card-foreground">
              <div className="w-64 p-4 bg-muted rounded-tr-none rounded-br-none rounded-xl">
                <div className="flex flex-col">
                  {Steps.map((step, index) => {
                    const isActive = step.id === currentStep;
                    const isCompleted = step.id < currentStep;
                    const isLastStep = index === Steps.length - 1;

                    return (
                      <div key={step.id} className="relative">
                        <div
                          className={`flex items-start gap-3 rounded-xl p-3 transition-all ${
                            isActive ? "bg-background" : ""
                          }`}>
                          <div className="relative mt-1 z-10">
                            {isCompleted ? (
                              <CheckCircle2 className="h-5 w-5 text-green-500 bg-muted rounded-full" />
                            ) : isActive ? (
                              <div className="h-5 w-5 rounded-full border-2 border-primary flex items-center justify-center bg-muted">
                                <div className="h-2.5 w-2.5 rounded-full bg-primary"></div>
                              </div>
                            ) : (
                              <Circle className="h-5 w-5 text-muted-foreground bg-muted rounded-full" />
                            )}
                          </div>
                          <div>
                            <p
                              className={`font-medium ${isActive ? "text-primary" : "text-foreground"}`}>
                              {step.title}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {step.description}
                            </p>
                          </div>
                        </div>

                        {!isLastStep && (
                          <div className="absolute left-[22px] top-[44px] w-0.5 h-6 bg-border"></div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
              {/* Step Content */}
              <Card className="flex-1 shadow-none border-0 py-0">
                <CardContent className="p-6 h-full flex flex-col justify-between">
                  {Steps[currentStep - 1].component}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
