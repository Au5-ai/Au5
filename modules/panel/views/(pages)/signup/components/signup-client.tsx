"use client";

import Logo from "@/shared/components/logo";
import { Card, CardContent } from "@/shared/components/ui";
import { CheckCircle2, Circle } from "lucide-react";
import { useState } from "react";
import { CAPTIONS } from "../i18n";
import { GLOBAL_CAPTIONS } from "@/shared/i18n/captions";
import { DownloadStep } from "./steps/download-step";
import { SignupStep } from "./steps/signup-step";

export default function SignupClient() {
  const [currentStep, setCurrentStep] = useState(1);

  const nextStep = () => {
    if (currentStep < 2) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const Steps = [
    {
      id: 1,
      title: CAPTIONS.downloadExtensionTitle,
      description: CAPTIONS.downloadExtensionDescription,
      component: <DownloadStep next={nextStep} />,
    },
    {
      id: 2,
      title: CAPTIONS.signupTitle,
      description: CAPTIONS.signupDescription,
      component: <SignupStep />,
    },
  ];

  return (
    <div className="bg-gradient bg-muted flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
      <div className="flex flex-col gap-6">
        <Logo href="#" text={GLOBAL_CAPTIONS.brandName} />
        <div className="flex items-center justify-center w-[800px]">
          <div className="flex rounded-xl border shadow-sm w-full gap-2 bg-card text-card-foreground">
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
        <div className="text-muted-foreground text-center text-xs text-balance *:[a]:underline *:[a]:underline-offset-4 *:[a]:hover:text-primary">
          {GLOBAL_CAPTIONS.pages.signup.footer.text}
        </div>
      </div>
    </div>
  );
}
