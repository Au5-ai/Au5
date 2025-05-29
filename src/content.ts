//https://meet.google.com/uir-miof-cby

import {detectBrowser} from "./core/browser/browserDetector";
import {ConfigurationManager} from "./core/configurationManager";
import {createMeetingPlatformInstance} from "./core/meetingPlatform";
import {runPipesAsync} from "./core/pipeline";
import {Meet, PipelineContext, TranscriptBlock, TranscriptionEntry, User} from "./core/types";
import {AppConfiguration} from "./core/types/configuration";
import {DomUtils} from "./core/utils/dom.utils";
import {WindowMessageHandler} from "./core/windowMessageHandler";
import SidePanel from "./ui/sidePanel";
import {establishConnection} from "./socket/meetingHubClient";
import {MessageTypes} from "./socket/types/enums";
import {
  HubMessage,
  ListOfUsersInMeetingMessage,
  StartTranscription,
  TranscriptionEntryMessage,
  UserJoinedInMeetingMessage
} from "./socket/types";

let meet: Meet;
let transcriptBlocks: TranscriptBlock[] = [];
let hasMeetingEnded = false;
let transcriptObserver: MutationObserver;
let config: AppConfiguration;
let transcriptContainer: HTMLElement | null;
let currentTransciptBlockId = "",
  currentTranscript = "";
let currentTimestamp: Date = new Date();
const browser = detectBrowser();
const domUtils = new DomUtils(browser);
const windowMessageHandler = new WindowMessageHandler("Au5-InjectedScript", "Au5-ContentScript", handleWindowMessage);

(async function initMeetingRoutine(): Promise<void> {
  try {
    const configurationManager = new ConfigurationManager(browser);
    config = await configurationManager.getConfig();

    await domUtils.waitForMatch(config.extension.meetingEndIcon.selector, config.extension.meetingEndIcon.text);

    const platform = createMeetingPlatformInstance(window.location.href);
    if (!platform) {
      console.error("Unsupported meeting platform");
      return;
    }

    const meetingId = platform.getMeetingTitle();

    SidePanel.createSidePanel("Asax Co", meetingId, config.service.direction);
    establishConnection(config, meetingId, platform.getPlatformName());
    meet = {
      id: meetingId,
      platform: platform.getPlatformName(),
      startAt: new Date().toISOString(),
      endAt: "",
      isStarted: false,
      transcripts: [],
      users: []
    };

    document.getElementById(config.extension.btnTranscriptSelector)?.addEventListener("click", () => {
      meet.users = listOfUsersInMeeting;
      meet.isStarted = true;
      SidePanel.showTranscriptionsContainer();

      runPipesAsync(
        {} as PipelineContext,
        Pipelines.activateCaptionsPipe,
        Pipelines.findTranscriptContainerPipe,
        Pipelines.observeTranscriptContainerPipe,
        Pipelines.addEndMeetingButtonListenerPipe
      );

      windowMessageHandler.postToWindow({
        meetingId: meetingId,
        userId: config.user.userId
      } as StartTranscription);
    });
  } catch (error) {
    console.error("Meeting routine execution failed:", error);
  }
})();

namespace Pipelines {
  export const activateCaptionsPipe = async (ctx: PipelineContext): Promise<PipelineContext> => {
    const captionsIcon = config.extension.captionsIcon;
    const captionsButton = domUtils.selectAll(captionsIcon.selector, captionsIcon.text)[0];
    captionsButton?.click();
    return ctx;
  };

  export const findTranscriptContainerPipe = async (ctx: PipelineContext): Promise<PipelineContext> => {
    const dom = domUtils.getDomContainer(
      config.extension.transcriptSelectors.aria,
      config.extension.transcriptSelectors.fallback
    );
    if (!dom) throw new Error("Transcript container not found in DOM");
    ctx.transcriptContainer = dom.container;
    transcriptContainer = dom.container;
    ctx.canUseAriaBasedTranscriptSelector = dom.usedAria;
    return ctx;
  };

  export const observeTranscriptContainerPipe = async (ctx: PipelineContext): Promise<PipelineContext> => {
    if (ctx.transcriptContainer) {
      transcriptObserver = new MutationObserver(createMutationHandler(ctx));
      transcriptObserver.observe(ctx.transcriptContainer, {
        childList: true,
        subtree: true,
        attributes: true,
        characterData: true
      });
    }
    return ctx;
  };

  export const addEndMeetingButtonListenerPipe = async (ctx: PipelineContext): Promise<PipelineContext> => {
    endMeetingRoutines();
    return ctx;
  };
}

let listOfUsersInMeeting: User[] = [];
function handleWindowMessage(action: string, payload: HubMessage): void {
  switch (action) {
    case MessageTypes.NotifyRealTimeTranscription:
      const transcriptEntry = payload as TranscriptionEntryMessage;

      SidePanel.addTranscription({
        meetingId: transcriptEntry.meetingId,
        transcriptBlockId: transcriptEntry.transcriptionBlockId,
        speaker: transcriptEntry.speaker,
        transcript: transcriptEntry.transcript,
        timestamp: transcriptEntry.timestamp
      } as TranscriptionEntry);
      break;

    case MessageTypes.NotifyUserJoining:
      const userJoinedMsg = payload as UserJoinedInMeetingMessage;

      if (!userJoinedMsg.user) {
        return;
      }

      const item: User = {
        id: userJoinedMsg.user.id,
        fullName: userJoinedMsg.user.fullName,
        pictureUrl: userJoinedMsg.user.pictureUrl,
        joinedAt: userJoinedMsg.user.joinedAt || new Date()
      };
      listOfUsersInMeeting.push(item);
      SidePanel.usersJoined(item, meet.isStarted);
      break;

    case MessageTypes.TriggerTranscriptionStart:
      SidePanel.showTranscriptionsContainer();
      meet.isStarted = true;
      break;

    case MessageTypes.ListOfUsersInMeeting:
      const usersInMeeting = payload as ListOfUsersInMeetingMessage;

      if (!usersInMeeting.users || !Array.isArray(usersInMeeting.users)) {
        return;
      }
      usersInMeeting.users.forEach((user: User) => {
        const item: User = {
          id: user.id,
          fullName: user.fullName,
          pictureUrl: user.pictureUrl,
          joinedAt: user.joinedAt || new Date()
        };
        listOfUsersInMeeting.push(item);
        SidePanel.addParticipant(item);
      });
      break;
    default:
      console.warn("Unknown message action received:", action);
  }
}

/**
 * Handles mutations observed in the transcript container and processes transcript updates.
 *
 * This function iterates over the list of mutations, extracts speaker and transcript information,
 * manages the transcript buffer, and posts updates to the window for further processing.
 * It distinguishes between new speakers, continuing speakers, and handles transcript flushing
 * when necessary. It also manages transcript length and error handling.
 *
 * @param mutations - An array of MutationRecord objects representing changes to the transcript container.
 * @param ctx - The pipeline context containing DOM references and configuration flags.
 */
function createMutationHandler(ctx: PipelineContext) {
  return function (mutations: MutationRecord[], observer: MutationObserver) {
    handleTranscriptMutations(mutations, ctx);
  };
}

/**
 * Extracts caption data from a given block element.
 *
 * @param block - The block element containing caption data.
 * @returns An object containing the block ID, speaker name, image URL, and text content.
 */
const extractCaptionData = (block: Element) => {
  const blockId = block.getAttribute("data-blockid")!;
  const img = block.querySelector("img");
  const nameSpan = block.querySelector("span");
  const textDiv = Array.from(block.querySelectorAll("div")).find(
    d => d.childElementCount === 0 && d.textContent?.trim()
  );

  return {
    blockId,
    speakerName: nameSpan?.textContent?.trim() ?? "",
    pictureUrl: img?.getAttribute("src") ?? "",
    transcript: textDiv?.textContent?.trim() ?? ""
  };
};

const isCaptionBlock = (el: Element): boolean => el.parentElement === transcriptContainer;

const processBlock = (el: Element) => {
  if (!el.hasAttribute("data-blockid")) {
    el.setAttribute("data-blockid", crypto.randomUUID());
  }
  return extractCaptionData(el);
};

const findCaptionBlock = (el: Node): Element | null => {
  let current = el.nodeType === Node.ELEMENT_NODE ? (el as Element) : el.parentElement;
  while (current && current.parentElement !== transcriptContainer) {
    current = current.parentElement;
  }
  return current?.parentElement === transcriptContainer ? current : null;
};

function handleTranscriptMutations(mutations: MutationRecord[], ctx: PipelineContext): void {
  for (const _ of mutations) {
    try {
      let blockTranscription = null;
      for (const mutation of mutations) {
        // Handle added blocks
        mutation.addedNodes.forEach(node => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            const el = node as Element;
            if (isCaptionBlock(el)) {
              blockTranscription = processBlock(el);
            }
          }
        });

        // Handle changes in existing block's content
        const rootBlock = findCaptionBlock(mutation.target);
        if (rootBlock) {
          blockTranscription = processBlock(rootBlock);
        }
      }

      if (blockTranscription) {
        if (blockTranscription.speakerName == "You") {
          blockTranscription.speakerName = config.user.fullName;
        }

        SidePanel.addTranscription({
          meetingId: meet.id,
          transcriptBlockId: blockTranscription.blockId,
          speaker: {fullName: blockTranscription.speakerName, pictureUrl: blockTranscription.pictureUrl} as User,
          transcript: blockTranscription.transcript,
          timestamp: new Date()
        } as TranscriptionEntry);

        windowMessageHandler.postToWindow({
          type: MessageTypes.NotifyRealTimeTranscription,
          meetingId: meet.id,
          transcriptionBlockId: currentTransciptBlockId,
          speaker: {fullName: blockTranscription.speakerName, pictureUrl: blockTranscription.pictureUrl} as User,
          transcript: currentTranscript,
          timestamp: currentTimestamp
        } as TranscriptionEntryMessage);
      }
    } catch (err) {
      console.error(err);
      if (!hasMeetingEnded) {
        console.log("Error in transcript mutation observer:", err);
      }
    }
  }
}

function endMeetingRoutines(): void {
  try {
    const elements = domUtils.selectAll(config.extension.meetingEndIcon.selector, config.extension.meetingEndIcon.text);
    const meetingEndButton = elements?.[0]?.parentElement?.parentElement ?? null;

    if (!meetingEndButton) {
      throw new Error("Meeting end button not found in DOM.");
    }

    meetingEndButton.addEventListener("click", () => {
      hasMeetingEnded = true;
      meet.endAt = new Date().toISOString();
      transcriptObserver?.disconnect();
      SidePanel.destroy();
      console.log("Meeting ended. Transcript data:", JSON.stringify(transcriptBlocks));
    });
  } catch (err) {
    console.error("Error setting up meeting end listener:", err);
  }
}
