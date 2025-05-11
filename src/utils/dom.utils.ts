/**
 * Waits until a DOM element matching the selector (and optionally, text content) appears.
 * Uses animation frame loop for responsiveness.
 *
 * @param selector - CSS selector string to match DOM elements
 * @param text - Optional text content to match
 * @returns A Promise that resolves with the found HTMLElement
 */
export async function waitForElement(selector: string, text?: string): Promise<HTMLElement> {
  const matchesText = (element: Element) => (text ? element.textContent?.trim() === text : true);

  while (true) {
    const elements = Array.from(document.querySelectorAll(selector));
    const found = elements.find(matchesText);

    if (found instanceof HTMLElement) {
      return found;
    }

    await new Promise(requestAnimationFrame);
  }
}

export function selectElements(selector: string, text?: string): HTMLElement[] {
  const elements = document.querySelectorAll<HTMLElement>(selector);
  if (!text) {
    return Array.from(elements);
  }

  const regex = new RegExp(text);
  return Array.from(elements).filter(element => regex.test(element.textContent || ""));
}

export function applyDomStyle(
  container: HTMLElement,
  canUseAriaBasedTranscriptSelector: boolean,
  opacity: string
): void {
  if (canUseAriaBasedTranscriptSelector) {
    container.style.opacity = opacity;
  } else {
    const innerElement = container.children[1] as HTMLElement | undefined;
    innerElement?.setAttribute("style", `opacity: ${opacity};`);
  }
}

export function findDom(aria: string, fallback: string): {container: HTMLElement | null; useAria: boolean} {
  let container = document.querySelector<HTMLElement>(aria);
  const useAria = Boolean(container);

  if (!container) {
    container = document.querySelector<HTMLElement>(fallback);
  }

  return {container, useAria};
}
