import { CompleteStep } from "./steps/complete-step";
import { ConfigureStep } from "./steps/configure-step";
import { DownloadStep } from "./steps/download-step";

export const Steps = [
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
