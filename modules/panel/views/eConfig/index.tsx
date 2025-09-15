"use client";
import Logo from "@/shared/components/logo";
import { useState } from "react";
import { CheckCircle2, ChevronLeft, ChevronRight, Circle } from "lucide-react";
import { useRouter } from "next/navigation";
import { Steps } from "./models";
import { Button, Card, CardContent } from "@/shared/components/ui";
import { handleCelebration } from "@/shared/lib/utils";

export default function OnboardingPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);

  const nextStep = () => {
    if (currentStep < Steps.length) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  return (
    <div
      style={{
        background:
          "linear-gradient(to bottom, #f8fbff 0%, #f4f0ec 28%, #f4eae7 66%, #f4e8ec 100%)",
        color: "black",
        display: "flex",
      }}
      className="bg-muted flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
      <div className="flex flex-col gap-6">
        <a href="#" className="flex items-center gap-2 font-medium">
          <div className="bg-primary text-primary-foreground flex size-6 items-center justify-center rounded-md">
            <Logo />
          </div>
          Au5.ai
        </a>
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
                          isActive ? "bg-muted" : ""
                        }`}>
                        <div className="relative mt-1 z-10">
                          {isCompleted ? (
                            <CheckCircle2 className="h-5 w-5 text-green-500 bg-muted rounded-full" />
                          ) : (
                            <Circle
                              className={`h-5 w-5 ${
                                isActive
                                  ? "text-primary"
                                  : "text-muted-foreground"
                              } bg-muted rounded-full`}
                              style={isActive ? { strokeWidth: 5 } : {}}
                            />
                          )}
                        </div>
                        <div>
                          <p
                            className={`font-medium ${
                              isActive ? "text-primary" : "text-foreground"
                            }`}>
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
                <div>{Steps[currentStep - 1].component}</div>
                <div className="flex justify-between">
                  <Button
                    variant="outline"
                    onClick={prevStep}
                    disabled={currentStep === 1}>
                    <ChevronLeft />
                    Back
                  </Button>
                  {currentStep === Steps.length ? (
                    <Button
                      className="cursor-pointer"
                      onClick={() => {
                        handleCelebration();

                        setTimeout(() => {
                          router.push("/playground");
                        }, 3000);
                      }}>
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
