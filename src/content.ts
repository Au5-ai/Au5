//https://meet.google.com/uir-miof-cby

import {detectBrowser} from "./core/browser/browserDetector";
import {ConfigurationManager} from "./core/configurationManager";
import {createMeetingPlatformInstance} from "./core/meetingPlatform";
import {runPipesAsync} from "./core/pipeline";
import {Meet, PipelineContext, TranscriptBlock, User} from "./core/types";
import {AppConfiguration} from "./core/types/configuration";
import {DomUtils} from "./core/utils/dom.utils";
import {MessageTypes} from "./socket/types";
import {WindowMessageHandler} from "./socket/windowMessageHandler";
import SidePanel from "./ui/sidePanel";

let meet: Meet;
let transcriptBlocks: TranscriptBlock[] = [];
let transcriptObserver: MutationObserver;
let config: AppConfiguration;
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
    // SidePanel.addCurrentUser(appConfig.Service.fullName);
    domUtils.injectScript("meetingHubClient.js");

    document.getElementById("au5-startTranscription-btn")?.addEventListener("click", () => {
      meet = {
        id: meetingId,
        platform: platform.getPlatformName(),
        startAt: new Date().toISOString(),
        endAt: "",
        transcript: [],
        users: [
          {
            id: config.user.userId,
            fullname: config.user.fullName,
            pictureUrl: config.user.pictureUrl,
            joinedAt: new Date().toISOString()
          } as User
        ]
      };

      SidePanel.showTranscriptionsContainer();

      runPipesAsync(
        {} as PipelineContext,
        Pipelines.activateCaptionsPipe,
        Pipelines.findTranscriptContainerPipe,
        Pipelines.observeTranscriptContainerPipe,
        Pipelines.addEndMeetingButtonListenerPipe
      );

      windowMessageHandler.postToWindow({
        header: {type: MessageTypes.TriggerTranscriptionStart},
        payload: {
          MeetingId: meetingId,
          User: {
            Id: config.user.userId,
            FullName: config.user.fullName,
            PictureUrl: config.user.pictureUrl
          }
        }
      });
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
    ctx.canUseAriaBasedTranscriptSelector = dom.usedAria;
    return ctx;
  };

  export const observeTranscriptContainerPipe = async (ctx: PipelineContext): Promise<PipelineContext> => {
    if (ctx.transcriptContainer) {
      transcriptObserver = new MutationObserver(createMutationHandler(ctx));
      transcriptObserver.observe(ctx.transcriptContainer, {
        childList: true,
        attributes: true,
        subtree: true,
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

function handleWindowMessage(action: string, payload: any) {
  console.log("Received action:", action);
  console.log("Received payload:", payload);

  // window.addEventListener("message", event => {
  //   const {data, source} = event;

  //   // Validate source
  //   if (source !== window || data?.source !== MeetingHubConfig.messageSources.injectedScript) {
  //     return;
  //   }

  //   const {action, payload} = data;

  //   switch (action) {
  //     case MeetingHubConfig.contentScriptActions.TRANSCRIPTION_UPDATE:
  //       //  SidePanel.updateLiveMessage(payload);
  //       break;

  //     case MeetingHubConfig.contentScriptActions.PARTICIPANT_JOINED:
  //       // SidePanel.addParticipant(payload);
  //       break;

  //     case MeetingHubConfig.contentScriptActions.TRANSCRIPTION_STARTED:
  //       //  SidePanel.hideParticipantList();
  //       break;

  //     case MeetingHubConfig.contentScriptActions.MeedHasBeenStarted:
  //       console.log("Meeting has started");
  //       SidePanel.showMessagesContainer();
  //       break;
  //     default:
  //       console.warn("Unknown message action received:", action);
  //   }
  // });
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
function handleTranscriptMutations(mutations: MutationRecord[], ctx: PipelineContext): void {
  for (const _ of mutations) {
    try {
      const transcriptContainer = ctx.canUseAriaBasedTranscriptSelector
        ? domUtils.selectSingle(config.extension.transcriptSelectors.aria)
        : domUtils.selectSingle(config.extension.transcriptSelectors.fallback);

      const speakerElements = ctx.canUseAriaBasedTranscriptSelector
        ? transcriptContainer?.children
        : transcriptContainer?.childNodes[1]?.firstChild?.childNodes;

      if (!speakerElements) return;
      const hasSpeakers = ctx.canUseAriaBasedTranscriptSelector
        ? speakerElements.length > 1
        : speakerElements.length > 0;

      if (!hasSpeakers) {
        if (currentSpeakerName && currentTranscript) {
          flushTranscriptBuffer({
            speaker: currentSpeakerName,
            transcript: currentTranscript,
            timestamp: currentTimestamp
          } as TranscriptBlock);
        }
        currentSpeakerId = "";
        currentSpeakerName = "";
        currentTranscript = "";
        continue;
      }
      const latestSpeakerElement = ctx.canUseAriaBasedTranscriptSelector
        ? (speakerElements[speakerElements.length - 2] as HTMLElement)
        : (speakerElements[speakerElements.length - 1] as HTMLElement);
      const nameNode = latestSpeakerElement.childNodes[0] as HTMLElement;
      const textNode = latestSpeakerElement.childNodes[1] as HTMLElement;

      const speakerName = nameNode?.textContent?.trim() ?? "";
      const transcriptText = textNode?.textContent?.trim() ?? "";

      if (!speakerName || !transcriptText) {
        // Send Error to Admin of Repo
        continue;
      }

      if (currentTranscript === "") {
        // New conversation start
        currentSpeakerId = crypto.randomUUID();
        currentSpeakerName = speakerName;
        currentTimestamp = new Date().toISOString();
        currentTranscript = transcriptText;
      } else if (currentSpeakerName !== speakerName) {
        // New speaker
        flushTranscriptBuffer({
          id: currentSpeakerId,
          speaker: currentSpeakerName,
          transcript: currentTranscript,
          timestamp: currentTimestamp
        } as TranscriptBlock);
        currentSpeakerId = crypto.randomUUID();
        currentSpeakerName = speakerName;
        currentTimestamp = new Date().toISOString();
        currentTranscript = transcriptText;
      } else {
        // Same speaker continuing
        if (ctx.canUseAriaBasedTranscriptSelector) {
          const textDiff = transcriptText.length - currentTranscript.length;
          if (textDiff < -config.extension.maxTranscriptLength) {
            flushTranscriptBuffer({
              id: currentSpeakerId,
              speaker: currentSpeakerName,
              transcript: currentTranscript,
              timestamp: currentTimestamp
            } as TranscriptBlock);
          }
        }

        currentTranscript = transcriptText;
        if (!ctx.canUseAriaBasedTranscriptSelector && transcriptText.length > config.extension.maxTranscriptLength) {
          latestSpeakerElement.remove();
        }
      }

      // SidePanel.updateLiveMessage({
      //   id: currentSpeakerId,
      //   speaker: currentSpeakerName,
      //   transcript: currentTranscript,
      //   timestamp: currentTimestamp
      // });
      window.postMessage(
        {
          source: MeetingHubConfig.messageSources.contentScript,
          action: MeetingHubConfig.contentScriptActions.TRANSCRIPTION_UPDATE,
          payload: {
            id: currentSpeakerId,
            speaker: currentSpeakerName,
            transcript: currentTranscript,
            timestamp: currentTimestamp
          }
        },
        "*"
      );
    } catch (err) {
      console.error(err);
      if (!hasMeetingEnded) {
        console.log("Error in transcript mutation observer:", err);
      }
    }
  }
}

function flushTranscriptBuffer(item: TranscriptBlock): void {
  if (!currentTranscript || !currentTimestamp) return;
  const name = item.speaker === "You" ? config.user.fullName : item.speaker;
  transcriptBlocks.push({
    id: item.id,
    speaker: name,
    timestamp: item.timestamp,
    transcript: item.transcript
  });
  //overWriteChromeStorage(["transcript"], false);
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
      transcriptObserver?.disconnect();
      if (currentSpeakerName && currentTranscript) {
        flushTranscriptBuffer({
          speaker: currentSpeakerName,
          transcript: currentTranscript,
          timestamp: currentTimestamp
        } as TranscriptBlock);
      }
      SidePanel.destroy();
      console.log("Meeting ended. Transcript data:", JSON.stringify(transcriptBlocks));
    });
  } catch (err) {
    console.error("Error setting up meeting end listener:", err);
  }
}

let hasMeetingEnded = false;

let currentSpeakerId = "",
  currentSpeakerName = "",
  currentTranscript = "",
  currentTimestamp = "";

// Observers
