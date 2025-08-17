"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle,
  Download,
  Settings,
  Sparkles,
  ArrowRight,
  ArrowLeft,
} from "lucide-react";
import confetti from "canvas-confetti";
import { CelebrationMessage } from "@/components/celebration-message";
import { userApi, orgApi } from "@/lib/api";
import { tokenStorageService } from "@/lib/services";
import { useRouter } from "next/navigation";

const steps = [
  {
    id: 1,
    title: "Install Extension",
    description: "Download and install our browser extension to get started",
    icon: Download,
    content: {
      heading: "Install Our Browser Extension",
      subheading:
        "Get the most out of our platform with our powerful browser extension",
      features: [
        "One-click data capture",
        "Seamless integration",
        "Real-time sync",
        "Enhanced productivity",
      ],
    },
  },
  {
    id: 2,
    title: "Send Configs",
    description: "Configure your settings and preferences",
    icon: Settings,
    content: {
      heading: "Configure Your Settings",
      subheading:
        "Customize the platform to match your workflow and preferences",
      features: [
        "API key integration",
        "Notification preferences",
        "Data sync settings",
        "Security configurations",
      ],
    },
  },
  {
    id: 3,
    title: "Finish Onboarding",
    description: "Complete your setup and start using the platform",
    icon: Sparkles,
    content: {
      heading: "You're All Set!",
      subheading: "Congratulations! Your account is now fully configured",
      features: [
        "Access to all features",
        "Priority support",
        "Regular updates",
        "Community access",
      ],
    },
  },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [showCelebration, setShowCelebration] = useState(false);
  const [isConfiguring, setIsConfiguring] = useState(false);
  const queryClient = useQueryClient();

  const progress = (currentStep / steps.length) * 100;
  const currentStepData = steps.find((step) => step.id === currentStep)!;

  const handleNext = () => {
    if (currentStep < steps.length) {
      setCompletedSteps((prev) => [...prev, currentStep]);
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleStepClick = (stepId: number) => {
    setCurrentStep(stepId);
  };

  const isStepCompleted = (stepId: number) => completedSteps.includes(stepId);
  const isCurrentStep = (stepId: number) => currentStep === stepId;
  const isLastStep = currentStep === steps.length;

  const handleSendConfigs = async () => {
    setIsConfiguring(true);
    try {
      const [user, orgConfig] = await Promise.all([
        userApi.me(),
        orgApi.getConfig(),
      ]);

      if (user && orgConfig) {
        const config = {
          user: {
            id: user.id,
            fullName: user.fullName,
            pictureUrl: user.pictureUrl,
            hasAccount: user.hasAccount,
          },
          service: {
            jwtToken: tokenStorageService.get(),
            panelUrl: orgConfig.panelUrl,
            baseUrl: orgConfig.serviceBaseUrl,
            direction: orgConfig.direction,
            language: orgConfig.language,
            hubUrl: orgConfig.hubUrl,
            companyName: orgConfig.name,
            botName: orgConfig.botName,
          },
        };

        window.postMessage(
          {
            source: "AU5_PANEL",
            type: "CONFIG_UPDATE",
            payload: config,
          },
          "*"
        );
        localStorage.setItem("setup", "true");
        localStorage.setItem("config", JSON.stringify(config));
        queryClient.setQueryData(["currentUser"], {
          ...user,
          hasAccount: user.hasAccount,
        });

        setCompletedSteps((prev) => [...prev, currentStep]);
        setCurrentStep(currentStep + 1);
      }
    } catch (error) {
      console.error("Failed to configure:", error);
    } finally {
      setIsConfiguring(false);
    }
  };

  const handleCelebration = () => {
    const duration = 3000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

    function randomInRange(min: number, max: number) {
      return Math.random() * (max - min) + min;
    }

    const interval: NodeJS.Timeout = setInterval(() => {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);

      // Fire from the left
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
      });

      // Fire from the right
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
      });
    }, 250);

    // Add some extra bursts
    setTimeout(() => {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });
    }, 100);

    setTimeout(() => {
      confetti({
        particleCount: 50,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
      });
      confetti({
        particleCount: 50,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
      });
    }, 200);

    // Show celebration message after a short delay
    setTimeout(() => {
      setShowCelebration(true);
    }, 1000);
  };

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4"
      style={{
        background:
          "linear-gradient(to bottom, #f8fbff 0%, #f4f0ec 28%, #f4eae7 66%, #f4e8ec 100%)",
      }}
    >
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome to Our Platform
          </h1>
          <p className="text-gray-600">
            Let's get you set up in just a few simple steps
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">Progress</span>
            <span className="text-sm font-medium text-gray-700">
              {currentStep} of {steps.length}
            </span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Step Navigation */}
        <div className="flex justify-center mb-8">
          <div className="flex space-x-4">
            {steps.map((step) => {
              const Icon = step.icon;
              return (
                <button
                  key={step.id}
                  onClick={() => handleStepClick(step.id)}
                  className={`flex flex-col items-center p-3 rounded-lg transition-all ${
                    isCurrentStep(step.id)
                      ? "bg-blue-100 text-blue-700"
                      : isStepCompleted(step.id)
                      ? "bg-green-100 text-green-700"
                      : "bg-white text-gray-500 hover:bg-gray-50"
                  }`}
                >
                  <div className="relative">
                    {isStepCompleted(step.id) ? (
                      <CheckCircle className="h-6 w-6" />
                    ) : (
                      <Icon className="h-6 w-6" />
                    )}
                  </div>
                  <span className="text-xs mt-1 font-medium">{step.title}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Main Content */}
        <Card className="mb-8">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div
                className={`p-3 rounded-full ${
                  isLastStep ? "bg-green-100" : "bg-blue-100"
                }`}
              >
                <currentStepData.icon
                  className={`h-8 w-8 ${
                    isLastStep ? "text-green-600" : "text-blue-600"
                  }`}
                />
              </div>
            </div>
            <CardTitle className="text-2xl">
              {currentStepData.content.heading}
            </CardTitle>
            <CardDescription className="text-lg">
              {currentStepData.content.subheading}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold mb-3">What you'll get:</h3>
                <ul className="space-y-2">
                  {currentStepData.content.features.map((feature, index) => (
                    <li key={index} className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="flex items-center justify-center">
                <div className="text-center">
                  {currentStep === 1 && (
                    <div className="space-y-4">
                      <div className="bg-gray-100 p-6 rounded-lg">
                        <Download className="h-12 w-12 text-blue-600 mx-auto mb-2" />
                        <p className="text-sm text-gray-600">
                          Extension Preview
                        </p>
                      </div>
                      <Button size="lg" className="w-full">
                        <Download className="h-4 w-4 mr-2" />
                        Download Extension
                      </Button>
                    </div>
                  )}
                  {currentStep === 2 && (
                    <div className="space-y-4">
                      <div className="bg-gray-100 p-6 rounded-lg">
                        <Settings className="h-12 w-12 text-blue-600 mx-auto mb-2" />
                        <p className="text-sm text-gray-600">
                          Configuration Panel
                        </p>
                      </div>
                      <Button
                        size="lg"
                        className="w-full"
                        onClick={handleSendConfigs}
                        disabled={isConfiguring}
                      >
                        <Settings className="h-4 w-4 mr-2" />
                        {isConfiguring ? "Configuring..." : "Open Settings"}
                      </Button>
                    </div>
                  )}
                  {currentStep === 3 && (
                    <div className="space-y-4">
                      <div className="bg-green-100 p-6 rounded-lg">
                        <Sparkles className="h-12 w-12 text-green-600 mx-auto mb-2" />
                        <p className="text-sm text-green-600">
                          Setup Complete!
                        </p>
                      </div>
                      <Badge
                        variant="secondary"
                        className="bg-green-100 text-green-800"
                      >
                        Ready to go!
                      </Badge>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Navigation Buttons */}
        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStep === 1}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Previous
          </Button>

          {isLastStep ? (
            <Button
              size="lg"
              className="bg-green-600 hover:bg-green-700"
              onClick={handleCelebration}
            >
              <Sparkles className="h-4 w-4 mr-2" />
              Get Started
            </Button>
          ) : (
            <Button onClick={handleNext}>
              Next
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          )}
        </div>

        {/* Skip Option */}
        {!isLastStep && (
          <div className="text-center mt-4">
            <button className="text-sm text-gray-500 hover:text-gray-700 underline">
              Skip onboarding
            </button>
          </div>
        )}
        {/* Celebration Modal */}
        <CelebrationMessage
          show={showCelebration}
          onClose={() => {
            setShowCelebration(false);
            router.push("/playground");
          }}
        />
      </div>
    </div>
  );
}
