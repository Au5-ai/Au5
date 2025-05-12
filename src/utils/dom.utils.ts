/**
 * Waits for an HTMLElement matching the given selector and optional text content.
 * Uses `requestAnimationFrame` for responsiveness.
 *
 * @param selector - CSS selector string
 * @param text - Optional exact text content to match
 * @returns Promise that resolves with the matching HTMLElement
 */
export async function waitForElement(selector: string, text?: string): Promise<HTMLElement> {
  const matchesText = (el: Element): boolean => (text ? el.textContent?.trim() === text : true);

  while (true) {
    const elements = Array.from(document.querySelectorAll(selector));
    const matched = elements.find(matchesText);

    if (matched instanceof HTMLElement) return matched;

    await new Promise(requestAnimationFrame);
  }
}

/**
 * Selects a single HTMLElement matching the selector.
 *
 * @param selector - CSS selector string
 * @returns The matching HTMLElement or null
 */
export function selectElement(selector: string): HTMLElement | null {
  return document.querySelector<HTMLElement>(selector);
}

/**
 * Selects all HTMLElements matching the selector and optional regex text match.
 *
 * @param selector - CSS selector string
 * @param text - Optional regex string to match text content
 * @returns Array of matching HTMLElements
 */
export function selectElements(selector: string, text?: string): HTMLElement[] {
  const elements = Array.from(document.querySelectorAll<HTMLElement>(selector));
  if (!text) return elements;

  const regex = new RegExp(text);
  return elements.filter(el => regex.test(el.textContent ?? ""));
}

/**
 * Applies opacity styling to a container, either directly or to its second child.
 *
 * @param container - The target container HTMLElement
 * @param useAriaSelector - Flag to decide whether to style the container or a child
 * @param opacity - Opacity value (e.g. "0.5")
 */
export function applyDomStyle(container: HTMLElement, useAriaSelector: boolean, opacity: string): void {
  if (useAriaSelector) {
    container.style.opacity = opacity;
  } else {
    const secondChild = container.children[1] as HTMLElement | undefined;
    secondChild?.setAttribute("style", `opacity: ${opacity};`);
  }
}

/**
 * Attempts to find a DOM container using aria selector first, then fallback.
 *
 * @param ariaSelector - ARIA-based CSS selector
 * @param fallbackSelector - Fallback CSS selector
 * @returns Object containing the container and whether ARIA selector was used
 */
export function findDomContainer(
  ariaSelector: string,
  fallbackSelector: string
): {container: HTMLElement | null; useAria: boolean} {
  let container = document.querySelector<HTMLElement>(ariaSelector);
  const useAria = !!container;

  if (!container) {
    container = document.querySelector<HTMLElement>(fallbackSelector);
  }

  return {container, useAria};
}
