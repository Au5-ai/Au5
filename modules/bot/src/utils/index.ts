/**
 * Returns a random delay within +/- 10% of the given amount.
 * Ensures the result is always positive and at least 0.
 */
export function randomDelay(amount: number): number {
  const variation = amount * 0.1;
  const min = Math.max(0, amount - variation);
  const max = amount + variation;
  return Math.random() * (max - min) + min;
}

export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
