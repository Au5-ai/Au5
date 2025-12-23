import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";

export function buildOnboardingUrlParams(
  step: number,
  userId: string | null,
  hash: string | null,
): string {
  const params = new URLSearchParams();
  if (userId) params.set("id", userId);
  if (hash) params.set("hash", hash);
  params.set("step", step.toString());
  return params.toString();
}

export function updateStepInUrl(
  step: number,
  userId: string | null,
  hash: string | null,
  router: AppRouterInstance,
) {
  const params = buildOnboardingUrlParams(step, userId, hash);
  router.replace(`?${params}`);
}

export function parseStepFromUrl(stepParam: string | null): number | null {
  if (!stepParam) return null;
  const step = parseInt(stepParam, 10);
  return step >= 1 && step <= 4 ? step : null;
}
