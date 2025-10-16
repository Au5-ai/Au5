import { toast } from "sonner";

export * from "./utils";

export { cn } from "./styling-utils";
export { validateUrl, validateEmail, validatePassword } from "./utils";
export { handleCelebration } from "./animation-utils";
export { formatDuration } from "./formatting-utils";
export { getRoleDisplay, getRoleType } from "./user-utils";
export type { RoleDisplay } from "./user-utils";

export const CopyToClipboard = (text: string) => {
  if (!text) return;
  if (typeof navigator.clipboard !== "undefined") {
    navigator.clipboard
      .writeText(text)
      .then(() => toast.success("Copied to clipboard!"))
      .catch(() => toast.error("Failed to copy."));
  } else {
    toast.error("Clipboard API not supported.");
  }
};
