import { CompleteStep } from "./steps/complete-step";
import { ConfigureStep } from "./steps/configure-step";
import { DownloadStep } from "./steps/download-step";
import { eConfigCaptions } from "./i18n";

export const Steps = [
  {
    id: 1,
    title: eConfigCaptions.downloadExtensionTitle,
    description: eConfigCaptions.downloadExtensionDescription,
    component: <DownloadStep />,
  },
  {
    id: 2,
    title: eConfigCaptions.configureExtensionTitle,
    description: eConfigCaptions.configureExtensionDescription,
    component: <ConfigureStep />,
  },
  {
    id: 3,
    title: eConfigCaptions.completeSetupTitle,
    description: eConfigCaptions.completeSetupDescription,
    component: <CompleteStep />,
  },
];
