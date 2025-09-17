import { CompleteStep } from "./steps/complete-step";
import { ConfigureStep } from "./steps/configure-step";
import { DownloadStep } from "./steps/download-step";
import { CAPTIONS } from "./i18n";

export const Steps = [
  {
    id: 1,
    title: CAPTIONS.downloadExtensionTitle,
    description: CAPTIONS.downloadExtensionDescription,
    component: <DownloadStep />,
  },
  {
    id: 2,
    title: CAPTIONS.configureExtensionTitle,
    description: CAPTIONS.configureExtensionDescription,
    component: <ConfigureStep />,
  },
  {
    id: 3,
    title: CAPTIONS.completeSetupTitle,
    description: CAPTIONS.completeSetupDescription,
    component: <CompleteStep />,
  },
];
