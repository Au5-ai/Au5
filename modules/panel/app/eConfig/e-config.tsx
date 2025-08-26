"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, ChevronLeft, ChevronRight, Circle } from "lucide-react";
import { DownloadStep } from "./download-step";
import { ConfigureStep } from "./configure-step";
import { CompleteStep } from "./complete-step";
import { handleCelebration } from "@/lib/utils";
import { useRouter } from "next/navigation";

const steps = [
  {
    id: 1,
    title: "Download Extension",
    description: "Get the latest version of the extension",
    component: <DownloadStep />,
  },
  {
    id: 2,
    title: "Configure Extension",
    description: "Configure the extension settings",
    component: <ConfigureStep />,
  },
  {
    id: 3,
    title: "Let's Go",
    description: "Complete the setup",
    component: <CompleteStep />,
  },
];

export default function EConfigPanel() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);

  const nextStep = () => {
    if (currentStep < steps.length) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  return (
    <div className="flex rounded-xl border shadow-sm w-full h-[600px] gap-2 bg-card text-card-foreground">
      {/* Sidebar Steps */}
      <div className="w-64 p-4 bg-muted rounded-tr-none rounded-br-none rounded-xl">
        <div className="flex flex-col">
          {steps.map((step, index) => {
            const isActive = step.id === currentStep;
            const isCompleted = step.id < currentStep;
            const isLastStep = index === steps.length - 1;

            return (
              <div key={step.id} className="relative">
                <div
                  className={`flex items-start gap-3 rounded-xl p-3 transition-all ${
                    isActive ? "bg-muted" : ""
                  }`}
                >
                  <div className="relative mt-1 z-10">
                    {isCompleted ? (
                      <CheckCircle2 className="h-5 w-5 text-green-500 bg-muted rounded-full" />
                    ) : (
                      <Circle
                        className={`h-5 w-5 ${
                          isActive ? "text-primary" : "text-muted-foreground"
                        } bg-muted rounded-full`}
                        style={isActive ? { strokeWidth: 5 } : {}}
                      />
                    )}
                  </div>
                  <div>
                    <p
                      className={`font-medium ${
                        isActive ? "text-primary" : "text-foreground"
                      }`}
                    >
                      {step.title}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {step.description}
                    </p>
                  </div>
                </div>

                {/* Vertical connecting line */}
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
          <div>{steps[currentStep - 1].component}</div>
          <div className="flex justify-between">
            <Button
              className="cursor-pointer"
              variant="outline"
              onClick={prevStep}
              disabled={currentStep === 1}
            >
              <ChevronLeft />
              Back
            </Button>
            {currentStep === steps.length ? (
              <Button
                className="cursor-pointer"
                onClick={() => {
                  handleCelebration();

                  setTimeout(() => {
                    router.push("/playground");
                  }, 3000);
                }}
              >
                Enjoy 🎉🎉
              </Button>
            ) : (
              <Button className="cursor-pointer" onClick={nextStep}>
                Next <ChevronRight />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
