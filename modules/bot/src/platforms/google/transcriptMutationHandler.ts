import { TranscriptionEntryMessage } from "../../types";
import { ElementHandle, Page } from "playwright-core";
import { Caption, GoogleDomConfiguration, MutationContext } from "./types";
import { DomUtility } from "./domUtility";
import { logger } from "../../utils/logger";

export class TranscriptMutationHandler {
  private domUtility: DomUtility;
  constructor(private page: Page, private config: GoogleDomConfiguration) {
    this.domUtility = new DomUtility(page);
  }

  async initialize(callback: (message: TranscriptionEntryMessage) => void) {
    await this.activateCaptions();
    let ctx = await this.findTranscriptContainer();
    await this.observeTranscriptContainer(ctx, callback);
  }

  private async activateCaptions(): Promise<void> {
    const { selector, text } = this.config.captionsIcon;

    const allCaptionsButtons = await this.domUtility.selectAllElements(
      selector,
      text
    );
    const captionsButton = allCaptionsButtons[0];

    if (captionsButton) {
      logger.info(
        `[GoogleMeet][Transcription] Activating captions using selector: ${selector}`
      );

      await captionsButton.click();
    }
  }

  private async findTranscriptContainer(): Promise<MutationContext> {
    const ctx: MutationContext = {
      transcriptContainer: null,
      canUseAriaBasedTranscriptSelector: false,
    };

    const dom = await this.domUtility.getCaptionContainer(
      this.config.transcriptSelectors.aria,
      this.config.transcriptSelectors.fallback
    );

    if (!dom) throw new Error("Transcript container not found in DOM");
    ctx.transcriptContainer = dom.container;
    ctx.canUseAriaBasedTranscriptSelector = dom.usedAria;
    logger.info(
      `[GoogleMeet][Transcription] Transcript container found: ${
        ctx.transcriptContainer || "unknown"
      }`
    );

    return ctx;
  }

  private async observeTranscriptContainer(
    ctx: MutationContext,
    callback: (message: TranscriptionEntryMessage) => void
  ): Promise<void> {
    if (!ctx.transcriptContainer) {
      logger.error(
        "[GoogleMeet][Transcription] Transcript container is not available."
      );
      return;
    }

    // Step 1: Expose a function to the browser context
    await this.page.exposeFunction(
      "handleTranscription",
      async (caption: Caption) => {
        callback({
          transcriptBlockId: caption.blockId,
          speaker: {
            fullName: caption.speakerName,
            pictureUrl: caption.pictureUrl,
          },
          transcript: caption.transcript,
          timestamp: new Date(),
          meetingId: "",
          type: "NotifyRealTimeTranscription",
        } as TranscriptionEntryMessage);
      }
    );

    // Step 2: Attach MutationObserver in browser context
    await this.page.evaluate((element) => {
      function findClosedCaptionTab(): HTMLElement | null {
        const icon = Array.from(document.querySelectorAll("[role=tab]")).find(
          (el) => el.textContent === "closed_caption"
        );

        return icon?.closest("[role=tab]") instanceof HTMLElement
          ? icon.closest("[role=tab]")
          : null;
      }

      function selectLiveCaptionsRadio(): void {
        const radioGroup = document.querySelector("div[role=radiogroup]");
        if (!radioGroup) return;

        const liveRadio = radioGroup.querySelector<HTMLInputElement>(
          'input[type="radio"][value="live"]'
        );
        if (liveRadio) {
          liveRadio.click();
        }
      }

      function findLanguageSelectorOption(value: string): HTMLElement | null {
        return (
          (document.querySelector(
            `[role=radio][data-value="${value}"]`
          ) as HTMLElement) ||
          (document.querySelector(
            `[type=radio][name=languageRadioGroup][value="${value}"]`
          ) as HTMLElement) ||
          (document.querySelector(
            `[role=option][data-value="${value}"]`
          ) as HTMLElement) ||
          null
        );
      }

      function findVisibleTabPanelCombobox(): HTMLElement | null {
        const visiblePanel = Array.from(
          document.querySelectorAll("div[role=tabpanel]")
        ).find(
          (el): el is HTMLElement =>
            el instanceof HTMLElement &&
            (el.offsetWidth > 0 ||
              el.offsetHeight > 0 ||
              el.getClientRects().length > 0)
        );

        if (!visiblePanel) return null;

        const combobox = visiblePanel.querySelector("[role=combobox]");
        return combobox instanceof HTMLElement ? combobox : null;
      }

      function findCaptionsTab(): HTMLElement | null {
        const match =
          Array.from(document.querySelectorAll("[role=tab]")).find((el) =>
            el.textContent?.includes("Captions")
          ) ?? null;

        return match instanceof HTMLElement ? match : null;
      }

      const findSetting = (label: string): HTMLElement | null => {
        const match = Array.from(
          document.querySelectorAll('[role*="menuitem"], [role*="button"]')
        ).find((el) => el.textContent?.includes(label));

        return match instanceof HTMLElement ? match : null;
      };

      const findMoreOptionsButton = (): HTMLElement | null => {
        const buttons = findMoreOptions("More options");
        if (buttons.length === 1) return buttons[0];

        for (const button of buttons) {
          const noParticipant = !button.closest("div[data-participant-id]");
          const hasAutoRejoin = button.closest("div[data-is-auto-rejoin]");

          if (noParticipant && hasAutoRejoin) {
            return button;
          }
        }

        return null;
      };

      const findMoreOptions = (menuLabel: string): HTMLElement[] => {
        const matches = document.querySelectorAll<HTMLButtonElement>(
          `button[aria-label*="${menuLabel}"]`
        );
        if (matches.length) {
          return Array.from(matches);
        }

        const icons = [
          ...Array.from(
            document.querySelectorAll<HTMLElement>("button i.google-symbols")
          ),
          ...Array.from(
            document.querySelectorAll<HTMLElement>(
              "button i.google-material-icons"
            )
          ),
        ];

        return icons
          .filter((el) => el.textContent?.trim() === "more_vert")
          .map((el) =>
            el.parentElement instanceof HTMLElement ? el.parentElement : el
          );
      };

      const isCaptionBlock = (
        container: HTMLElement | null,
        el: Element
      ): boolean => {
        return el.parentElement === container;
      };

      const findCaptionBlock = (
        container: HTMLElement | null,
        node: Node
      ): Element | null => {
        let current: Element | null =
          node.nodeType === Node.ELEMENT_NODE
            ? (node as Element)
            : node.parentElement;

        while (current && current.parentElement !== container) {
          current = current.parentElement;
        }

        return current?.parentElement === container ? current : null;
      };

      const extractCaptionData = (
        block: Element
      ): {
        blockId: string;
        speakerName: string;
        pictureUrl: string;
        transcript: string;
      } => {
        const blockId = block.getAttribute("data-blockid")!;
        const img = block.querySelector("img");
        const nameSpan = block.querySelector("span");
        const textDiv = Array.from(block.querySelectorAll("div")).find(
          (d) => d.childElementCount === 0 && d.textContent?.trim()
        );

        return {
          blockId,
          speakerName: nameSpan?.textContent?.trim() ?? "",
          pictureUrl: img?.getAttribute("src") ?? "",
          transcript: textDiv?.textContent?.trim() ?? "",
        };
      };

      const processBlock = (
        el: Element
      ): {
        blockId: string;
        speakerName: string;
        pictureUrl: string;
        transcript: string;
      } => {
        if (!el.hasAttribute("data-blockid")) {
          el.setAttribute("data-blockid", crypto.randomUUID());
        }
        return extractCaptionData(el);
      };

      const observer = new MutationObserver((mutations) => {
        for (const mutation of mutations) {
          // Handle added blocks
          for (const node of mutation.addedNodes) {
            if (node.nodeType === Node.ELEMENT_NODE) {
              const el = node as Element;
              if (isCaptionBlock(element, el)) {
                const captionBlock = processBlock(el);
                if (captionBlock.transcript.trim() !== "") {
                  // @ts-ignore
                  window.handleTranscription(captionBlock);
                }
              }
            }
          }

          // Handle updated blocks
          const target = mutation.target;
          if (target.nodeType === Node.ELEMENT_NODE) {
            const block = findCaptionBlock(element, target);
            if (block && isCaptionBlock(element, block)) {
              const captionBlock = processBlock(block);
              if (captionBlock.transcript.trim() !== "") {
                // @ts-ignore
                window.handleTranscription(captionBlock);
              }
            }
          }
        }
      });

      observer.observe(element, {
        childList: true,
        subtree: true,
        attributes: true,
        characterData: true,
      });
    }, ctx.transcriptContainer);

    logger.info("[GoogleMeet][Transcription] Mutation observer initialized.");
  }
}
