import { handleCelebration } from "@/shared/lib";
import { CAPTIONS } from "../../i18n";
import { GLOBAL_CAPTIONS } from "@/shared/i18n/captions";
import { Button } from "@/shared/components/ui";
import { useRouter } from "next/navigation";

export function CompleteStep() {
  const router = useRouter();
  return (
    <>
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-8">
          {CAPTIONS.congratulationsTitle}
        </h2>

        <p className="text-gray-600 mb-6">{CAPTIONS.completionMessage}</p>

        <div className="space-y-3">
          <p className="text-sm text-gray-500">{CAPTIONS.readyMessage}</p>
        </div>
      </div>

      <div className="flex justify-between">
        <div></div>

        <Button
          className="cursor-pointer"
          onClick={() => {
            handleCelebration();

            setTimeout(() => {
              router.push(`/${GLOBAL_CAPTIONS.playground}`);
            }, 3000);
          }}>
          {CAPTIONS.enjoyButtonText}
        </Button>
      </div>
    </>
  );
}
