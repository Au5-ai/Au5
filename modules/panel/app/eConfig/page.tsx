"use client";
import Logo from "@/components/logo";
import EConfigPanel from "./eConfigPanel";

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

// const router = useRouter();
// const [currentStep, setCurrentStep] = useState(1);
// const [completedSteps, setCompletedSteps] = useState<number[]>([]);
// const [isConfiguring, setIsConfiguring] = useState(false);
// const queryClient = useQueryClient();

// const progress = (currentStep / steps.length) * 100;
// const currentStepData = steps.find((step) => step.id === currentStep)!;

// const handleNext = () => {
//   if (currentStep < steps.length) {
//     setCompletedSteps((prev) => [...prev, currentStep]);
//     setCurrentStep(currentStep + 1);
//   }
// };

// const handlePrevious = () => {
//   if (currentStep > 1) {
//     setCurrentStep(currentStep - 1);
//   }
// };

// const handleStepClick = (stepId: number) => {
//   setCurrentStep(stepId);
// };

// const isStepCompleted = (stepId: number) => completedSteps.includes(stepId);
// const isCurrentStep = (stepId: number) => currentStep === stepId;
// const isLastStep = currentStep === steps.length;

// const handleSendConfigs = async () => {
//   setIsConfiguring(true);
//   try {
//     const [user, systemConfig] = await Promise.all([
//       userApi.me(),
//       systemApi.getExtensionConfig(),
//     ]);

//     if (user && systemConfig) {
//       const config = {
//         user: {
//           id: user.id,
//           fullName: user.fullName,
//           pictureUrl: user.pictureUrl,
//           hasAccount: user.hasAccount,
//         },
//         service: {
//           jwtToken: tokenStorageService.get(),
//           panelUrl: systemConfig.panelUrl,
//           baseUrl: systemConfig.serviceBaseUrl,
//           direction: systemConfig.direction,
//           language: systemConfig.language,
//           hubUrl: systemConfig.hubUrl,
//           companyName: systemConfig.organizationName,
//           botName: systemConfig.botName,
//         },
//       };

//       window.postMessage(
//         {
//           source: "AU5_PANEL",
//           type: "CONFIG_UPDATE",
//           payload: config,
//         },
//         "*"
//       );
//       localStorage.setItem("eConfig", "true");
//       localStorage.setItem("config", JSON.stringify(config));
//       queryClient.setQueryData(["currentUser"], {
//         ...user,
//         hasAccount: user.hasAccount,
//       });

//       setCompletedSteps((prev) => [...prev, currentStep]);
//       setCurrentStep(currentStep + 1);
//     }
//   } catch (error) {
//     console.error("Failed to configure:", error);
//   } finally {
//     setIsConfiguring(false);
//   }
// };
