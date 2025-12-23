import { useMutation } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { ROUTES } from "@/shared/routes";
import { tokenStorageService } from "@/shared/lib/localStorage";
import { GLOBAL_CAPTIONS } from "@/shared/i18n/captions";
import { AddUserRequest, AddUserResponse } from "./types";
import { userController } from "./controllers/userController";
import { organizationsController } from "./controllers/organizationsController";
import { parseStepFromUrl, updateStepInUrl } from "./utils";
import { CAPTIONS } from "./i18n";

export function useSignup() {
  return useMutation<AddUserResponse, unknown, AddUserRequest>({
    mutationFn: userController.verifyUser,
  });
}

export function useOnboardingVerification() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<"loading" | "ok">("loading");

  useEffect(() => {
    const userId = searchParams.get("id");
    const hash = searchParams.get("hash");
    const stepParam = searchParams.get("step");

    if (!userId || !hash) {
      router.push(ROUTES.FORBIDDEN);
      return;
    }

    const verify = async () => {
      try {
        const response = await userController.verify(userId, hash);
        if (response) {
          if (response.isRegistered) {
            router.push(ROUTES.REGISTERED);
            return;
          }
          setStatus("ok");
        } else {
          router.push(ROUTES.LOGIN);
        }
      } catch {
        router.push(ROUTES.LOGIN);
      }
    };

    if (!stepParam) {
      verify();
    } else {
      setStatus("ok");
    }
  }, [searchParams, router]);

  return { status };
}

export function useOnboardingSteps() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [currentStep, setCurrentStep] = useState(1);

  useEffect(() => {
    const stepParam = searchParams.get("step");
    const parsedStep = parseStepFromUrl(stepParam);
    if (parsedStep) {
      setCurrentStep(parsedStep);
    }
  }, [searchParams]);

  const nextStep = useCallback(() => {
    if (currentStep < 4) {
      const newStep = currentStep + 1;
      setCurrentStep(newStep);
      const userId = searchParams.get("id");
      const hash = searchParams.get("hash");
      updateStepInUrl(newStep, userId, hash, router);
    }
  }, [currentStep, searchParams, router]);

  return { currentStep, nextStep };
}

export function useDownloadStep() {
  const searchParams = useSearchParams();
  const [isInstalled, setIsInstalled] = useState(false);

  const handleRefreshAndContinue = () => {
    const userId = searchParams.get("id");
    const hash = searchParams.get("hash");
    const params = new URLSearchParams();
    if (userId) params.set("id", userId);
    if (hash) params.set("hash", hash);
    params.set("step", "2");
    window.location.href = `?${params.toString()}`;
  };

  return { isInstalled, setIsInstalled, handleRefreshAndContinue };
}

export function useConfigureStep(onNext: () => void) {
  const handleSendConfigs = async () => {
    try {
      const extensionConfig =
        await organizationsController.getExtensionConfig();

      if (extensionConfig) {
        window.postMessage(
          {
            source: "AU5_PANEL",
            type: "CONFIG_UPDATE",
            payload: extensionConfig,
          },
          window.location.origin,
        );

        const token = tokenStorageService.get();
        if (token) {
          window.postMessage(
            {
              source: "AU5_PANEL",
              type: "TOKEN_UPDATE",
              payload: token,
            },
            window.location.origin,
          );
        }
        toast.success(CAPTIONS.configurationSentSuccess);
        onNext();
      }
    } catch (error) {
      console.error(GLOBAL_CAPTIONS.errors.exConfig.failedToConfigure, error);
    }
  };

  return { handleSendConfigs };
}
