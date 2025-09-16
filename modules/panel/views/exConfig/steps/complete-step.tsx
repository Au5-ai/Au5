import { CAPTIONS } from "../i18n";

export function CompleteStep() {
  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-8">
        {CAPTIONS.congratulationsTitle}
      </h2>

      <p className="text-gray-600 mb-6">{CAPTIONS.completionMessage}</p>

      <div className="space-y-3">
        <p className="text-sm text-gray-500">{CAPTIONS.readyMessage}</p>
      </div>
    </div>
  );
}
