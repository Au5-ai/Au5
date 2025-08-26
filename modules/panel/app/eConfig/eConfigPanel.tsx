"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Circle } from "lucide-react";
import Image from "next/image";

const steps = [
  {
    id: 1,
    title: "Welcome",
    description: "Introduction to the platform",
    component: <WelcomeStep />,
  },
  {
    id: 2,
    title: "Download Extension",
    description: "Get Latest Version",
    component: <DownloadStep />,
  },
  {
    id: 3,
    title: "Let's Go",
    description: "Complete Extension Configuration",
    component: <CompleteStep />,
  },
];

export default function EConfigPanel() {
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
          <div>
            <h2 className="text-xl font-semibold mb-2">
              {steps[currentStep - 1].title}
            </h2>
            <p className="text-muted-foreground mb-6">
              {steps[currentStep - 1].description}
            </p>
            {steps[currentStep - 1].component}
          </div>
          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={prevStep}
              disabled={currentStep === 1}
            >
              Back
            </Button>
            {currentStep === steps.length ? (
              <Button>Finish</Button>
            ) : (
              <Button onClick={nextStep}>Next</Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function WelcomeStep() {
  return (
    <div>
      <Image
        src="/extension-install.png"
        width={480}
        height={400}
        alt="Welcome"
        className="rounded-lg"
        style={{ height: "auto" }}
      />
      <div className="flex justify-between py-6">
        <Button variant="outline">Add to Chrome - It's free!</Button>
        <Image
          src="/meets.svg"
          alt="Download Extension"
          className="rounded-lg cursor-pointer"
          width={100}
          height={100}
          style={{ height: "auto" }}
        />
      </div>
    </div>
  );
}

function DownloadStep() {
  return (
    <div>
      <Image
        src="/welcome.png"
        alt="Download Extension"
        className="rounded-lg"
        width={480}
        height={100}
        style={{ height: "auto" }}
      />

      <div className="flex justify-between py-6">
        <Button variant="outline">Send Config To Extension</Button>
      </div>
    </div>
  );
}

function CompleteStep() {
  return <div>Complete the setup process.</div>;
}
