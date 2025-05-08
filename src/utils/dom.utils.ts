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
