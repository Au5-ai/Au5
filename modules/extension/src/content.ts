//https://meet.google.com/uir-miof-cby

import {ConfigurationManager} from "./core/configurationManager";
import {runPipesAsync} from "./core/pipeline";
import {
  Caption,
  IMeetingPlatform,
  Meeting,
  PipelineContext,
  TranscriptBlock,
  TranscriptionEntry,
  User
} from "./core/types";
import {AppConfiguration} from "./core/types/configuration";
import {DomUtils} from "./core/utils/dom.utils";
import {WindowMessageHandler} from "./core/windowMessageHandler";
import SidePanel from "./ui/sidePanel";
import {MessageTypes} from "./hub/types/enums";
import {
  HubMessage,
  ListOfUsersInMeetingMessage,
  ReactionAppliedMessage,
  StartTranscription,
  TranscriptionEntryMessage,
  UserJoinedInMeetingMessage
} from "./hub/types";
import {Chrome} from "./core/chromeBrowser";
import {MeetingPlatformFactory} from "./core/platforms/meetingPlatformFactory";
import {MeetingHubClient} from "./hub/meetingHubClient";
import {PostMessageTypes} from "./core/constants";

let meetingHubClient: MeetingHubClient;
let meeting: Meeting;
let transcriptBlocks: TranscriptBlock[] = [];
let transcriptObserver: MutationObserver;
let config: AppConfiguration;
let transcriptContainer: HTMLElement | null;
const platform: IMeetingPlatform = new MeetingPlatformFactory(window.location.href).getPlatform();
const browser = new Chrome();
const domUtils = new DomUtils(browser);
const windowMessageHandler = new WindowMessageHandler(
  PostMessageTypes.ContentScript,
  PostMessageTypes.MeetingHubClient,
  handleWindowMessage
);

(async function initMeetingRoutine(): Promise<void> {
  try {
    const configurationManager = new ConfigurationManager(browser);
    config = await configurationManager.getConfig();

    await domUtils.waitForMatch(config.extension.meetingEndIcon.selector, config.extension.meetingEndIcon.text);

    if (!platform) {
      console.error("Unsupported meeting platform");
      return;
    }

    meeting = {
      id: platform.getMeetingTitle(),
      platform: platform.getPlatformName(),
      startAt: new Date(),
      endAt: null,
      isStarted: false,
      isEnded: false,
      transcripts: [],
      users: []
    };

    SidePanel.createSidePanel(config, meeting.id);
    meetingHubClient = new MeetingHubClient(config, meeting.id);
    meetingHubClient.startConnection(); // TODO: Handle when the user clicks to join the meeting

    document.getElementById(config.extension.btnTranscriptSelector)?.addEventListener("click", () => {
      meeting.isStarted = true;
      SidePanel.showTranscriptionsContainer();

      runPipesAsync(
        {} as PipelineContext,
        Pipelines.activateCaptionsPipe,
        Pipelines.findTranscriptContainerPipe,
        Pipelines.observeTranscriptContainerPipe,
        Pipelines.addEndMeetingButtonListenerPipe
      );

      windowMessageHandler.postToWindow({
        meetingId: meeting.id,
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
    try {
      const elements = domUtils.selectAll(
        config.extension.meetingEndIcon.selector,
        config.extension.meetingEndIcon.text
      );
      const meetingEndButton = elements?.[0]?.parentElement?.parentElement ?? null;

      if (!meetingEndButton) {
        throw new Error("Meeting end button not found in DOM.");
      }
      meetingEndButton.addEventListener("click", () => {
        meeting.isEnded = true;
        meeting.endAt = new Date();
        transcriptObserver?.disconnect();
        SidePanel.destroy();
        console.log("Meeting ended. Transcript data:", JSON.stringify(transcriptBlocks));
      });
    } catch (err) {
      console.error("Error setting up meeting end listener:", err);
    }
    return ctx;
  };
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
  try {
    let blockTranscription: Caption = {blockId: "", speakerName: "", pictureUrl: "", transcript: ""};
    for (const mutation of mutations) {
      // Handle added blocks
      mutation.addedNodes.forEach(node => {
        if (node.nodeType === Node.ELEMENT_NODE) {
          const el = node as Element;
          if (platform.isCaptionBlock(transcriptContainer, el)) {
            blockTranscription = platform.processBlock(el);
          }
        }
      });

      // Handle changes in existing block's content
      const rootBlock = platform.findCaptionBlock(transcriptContainer, mutation.target);
      if (rootBlock) {
        blockTranscription = platform.processBlock(rootBlock);
      }
    }

    if (blockTranscription) {
      if (blockTranscription.transcript.trim() === "") {
        return;
      }

      if (blockTranscription.speakerName == "You") {
        blockTranscription.speakerName = config.user.fullName;
      }

      const block = meeting.transcripts.find(t => t.id === blockTranscription.blockId);

      if (block && blockTranscription.transcript.trim() == block.transcript.trim()) {
        return; // No change in transcript, skip processing
      }

      if (!block) {
        meeting.transcripts.push({
          id: blockTranscription.blockId,
          user: {
            fullName: blockTranscription.speakerName,
            pictureUrl: blockTranscription.pictureUrl
          },
          timestamp: new Date(),
          transcript: blockTranscription.transcript
        });
      } else {
        block.transcript = blockTranscription.transcript;
      }

      SidePanel.addTranscription({
        meetingId: meeting.id,
        transcriptBlockId: blockTranscription.blockId,
        speaker: {fullName: blockTranscription.speakerName, pictureUrl: blockTranscription.pictureUrl},
        transcript: blockTranscription.transcript,
        timestamp: new Date()
      });

      windowMessageHandler.postToWindow({
        type: MessageTypes.NotifyRealTimeTranscription,
        meetingId: meeting.id,
        transcriptBlockId: blockTranscription.blockId,
        speaker: {fullName: blockTranscription.speakerName, pictureUrl: blockTranscription.pictureUrl},
        transcript: blockTranscription.transcript,
        timestamp: new Date()
      } as TranscriptionEntryMessage);
    }
  } catch (err) {
    console.error(err);
    if (!meeting.isEnded) {
      console.log("Error in transcript mutation observer:", err);
    }
  }
}

export function handleWindowMessage(action: string, payload: HubMessage): void {
  switch (action) {
    case MessageTypes.NotifyRealTimeTranscription:
      const transcriptEntry = payload as TranscriptionEntryMessage;

      SidePanel.addTranscription({
        meetingId: transcriptEntry.meetingId,
        transcriptBlockId: transcriptEntry.transcriptBlockId,
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
      meeting.users.push(item);
      SidePanel.usersJoined(item, meeting.isStarted);
      break;

    case MessageTypes.TriggerTranscriptionStart:
      SidePanel.showTranscriptionsContainer();
      meeting.isStarted = true;
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
        meeting.users.push(item);
        SidePanel.addParticipant(item);
      });
      break;

    case MessageTypes.ReactionApplied:
      const reactionMsg = payload as ReactionAppliedMessage;
      if (!reactionMsg.meetingId || !reactionMsg.transcriptBlockId || !reactionMsg.user || !reactionMsg.reaction) {
        return;
      }
      const reactionBlock = meeting.transcripts.find(t => t.id === reactionMsg.transcriptBlockId);
      if (reactionBlock) {
        if (!reactionBlock.reactions) {
          reactionBlock.reactions = {};
        }
        if (!reactionBlock.reactions[reactionMsg.reaction]) {
          reactionBlock.reactions[reactionMsg.reaction] = [];
        }
        reactionBlock.reactions[reactionMsg.reaction].push(reactionMsg.user);
      }
      SidePanel.addReaction(reactionMsg);
      break;
    default:
      console.warn("Unknown message action received:", action);
  }
}
