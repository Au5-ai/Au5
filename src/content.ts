//https://meet.google.com/uir-miof-cby

import {detectBrowser} from "./core/browser/browserDetector";
import {ConfigurationManager} from "./core/configurationManager";
import {createMeetingPlatformInstance} from "./core/meetingPlatform";
import {runPipesAsync} from "./core/pipeline";
import {Meet, PipelineContext, TranscriptBlock, User} from "./core/types";
import {AppConfiguration} from "./core/types/configuration";
import {DomUtils} from "./core/utils/dom.utils";
import {MessageTypes} from "./socket/types";
import {WindowMessageHandler} from "./core/windowMessageHandler";
import SidePanel from "./ui/sidePanel";
import {establishConnection, MeetingHubClient} from "./socket/meetingHubClient";

let meet: Meet;
let transcriptBlocks: TranscriptBlock[] = [];
let hasMeetingEnded = false;
let transcriptObserver: MutationObserver;
let config: AppConfiguration;
let currentTransciptBlockId = "",
  currentSpeakerName = "",
  currentTranscript = "",
  currentTimestamp = "";
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
    establishConnection(config, meetingId);
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
        Header: {Type: MessageTypes.TriggerTranscriptionStart},
        Payload: {
          MeetingId: meetingId,
          User: {
            Id: config.user.userId
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

let listOfUsersInMeeting: User[] = [];
function handleWindowMessage(action: string, payload: any) {
  switch (action) {
    case MessageTypes.NotifyRealTimeTranscription:
      SidePanel.addTranscription({
        meetingId: meet.id,
        transcriptionBlockId: payload.TranscriptionBlockId,
        speaker: {
          id: payload.Speaker.Id,
          fullname: payload.Speaker.FullName,
          pictureUrl: payload.Speaker.PictureUrl
        } as User,
        transcript: payload.Transcript,
        timestamp: payload.Timestamp
      });
      break;

    case MessageTypes.NotifyUserJoining:
      const item: User = {
        id: payload.User.Id,
        fullname: payload.User.FullName,
        pictureUrl: payload.User.PictureUrl,
        joinedAt: payload.User.JoinedAt || new Date().toISOString()
      };
      listOfUsersInMeeting.push(item);
      SidePanel.usersJoined(item, meet.isStarted);
      break;

    case MessageTypes.NotifyUserLeft:
      SidePanel.usersLeaved(payload, meet.isStarted);
      break;

    case MessageTypes.NotifyMeetHasBeenStarted:
    case MessageTypes.TriggerTranscriptionStart:
      SidePanel.showTranscriptionsContainer();
      meet.isStarted = true;
      break;

    case MessageTypes.ListOfUsersInMeeting:
      payload.Users.forEach((user: any) => {
        const item: User = {
          id: user.Id,
          fullname: user.FullName,
          pictureUrl: user.PictureUrl,
          joinedAt: user.JoinedAt || new Date().toISOString()
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
      if (!hasSpeakers) return;

      const latestSpeakerElement = ctx.canUseAriaBasedTranscriptSelector
        ? (speakerElements[speakerElements.length - 2] as HTMLElement)
        : (speakerElements[speakerElements.length - 1] as HTMLElement);
      const nameNode = latestSpeakerElement.childNodes[0] as HTMLElement;
      const textNode = latestSpeakerElement.childNodes[1] as HTMLElement;
      let speakerName = nameNode?.textContent?.trim() ?? "";
      const transcriptText = textNode?.textContent?.trim() ?? "";

      if (speakerName === "You") {
        speakerName = config.user.fullName;
      }

      let currentSpeaker = listOfUsersInMeeting.find(user => user.fullname === speakerName);
      if (!speakerName || !transcriptText) {
        // Send Error to Admin of Repo
        continue;
      }
      if (!currentSpeaker) {
        // If speaker is not in the list, add them
        currentSpeaker = {
          id: crypto.randomUUID(),
          fullname: speakerName,
          pictureUrl: config.extension.defaultPictureUrl,
          joinedAt: new Date().toISOString()
        };
        listOfUsersInMeeting.push(currentSpeaker);
      }

      if (currentTranscript === "") {
        // New conversation start
        currentTransciptBlockId = crypto.randomUUID();
        currentSpeakerName = speakerName;
        currentTimestamp = new Date().toISOString();
        currentTranscript = transcriptText;
      } else if (currentSpeakerName !== speakerName) {
        // New speaker
        flushTranscriptBuffer({
          id: currentTransciptBlockId,
          user: {fullname: currentSpeakerName},
          transcript: currentTranscript,
          timestamp: currentTimestamp
        } as TranscriptBlock);

        currentTransciptBlockId = crypto.randomUUID();
        currentSpeakerName = speakerName;
        currentTimestamp = new Date().toISOString();
        currentTranscript = transcriptText;
      } else {
        // Same speaker continuing
        if (ctx.canUseAriaBasedTranscriptSelector) {
          const textDiff = transcriptText.length - currentTranscript.length;
          if (textDiff < -config.extension.maxTranscriptLength) {
            flushTranscriptBuffer({
              id: currentTransciptBlockId,
              user: {fullname: currentSpeakerName},
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

      SidePanel.addTranscription({
        meetingId: meet.id,
        transcriptionBlockId: currentTransciptBlockId,
        speaker: currentSpeaker,
        transcript: currentTranscript,
        timestamp: currentTimestamp
      });

      windowMessageHandler.postToWindow({
        Header: {Type: MessageTypes.NotifyRealTimeTranscription},
        Payload: {
          MeetingId: meet.id,
          TranscriptionBlockId: currentTransciptBlockId,
          Speaker: {id: currentSpeaker?.id, fullName: currentSpeakerName},
          Transcript: currentTranscript,
          Timestamp: currentTimestamp
        }
      });
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
  item.user.fullname = item.user.fullname === "You" ? config.user.fullName : item.user.fullname;
  item.type = "transcript";
  transcriptBlocks.push(item);
  meet.transcripts.push(item);
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
      if (currentSpeakerName && currentTranscript) {
        flushTranscriptBuffer({
          id: currentTransciptBlockId,
          user: {fullname: currentSpeakerName},
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
