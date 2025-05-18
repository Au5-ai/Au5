//https://meet.google.com/uir-miof-cby
import {MeetingHubConfig} from "./core/constants";
import {pipeAsync} from "./core/pipeline";
import {AppConfiguration, ConfigurationService} from "./services/config.service";
import {StorageService} from "./services/storage.service";
import {PipelineContext, TranscriptBlock} from "./types";
import ChatPanel from "./ui/chatPanel";
import {setOpacity, getDomContainer, injectScript, selectAll, selectSingle, waitForMatch} from "./utils/dom.utils";

let appConfig: AppConfiguration;
const configService = new ConfigurationService(new StorageService());

let hasMeetingEnded = false;
let transcriptBlocks: TranscriptBlock[] = [];
let currentSpeakerId = "",
  currentSpeakerName = "",
  currentTranscript = "",
  currentTimestamp = "";

// Observers
let transcriptObserver: MutationObserver;

const activateCaptions = async (ctx: PipelineContext): Promise<PipelineContext> => {
  const captionsIcon = appConfig.Extension.captionsIcon;
  ctx.captionsButton = selectAll(captionsIcon.selector, captionsIcon.text)[0];
  ctx.captionsButton?.click();
  return ctx;
};

const findTranscriptContainer = async (ctx: PipelineContext): Promise<PipelineContext> => {
  const dom = getDomContainer(
    appConfig.Extension.transcriptSelectors.aria,
    appConfig.Extension.transcriptSelectors.fallback
  );
  if (!dom) throw new Error("Transcript container not found in DOM");
  ctx.transcriptContainer = dom.container;
  ctx.canUseAriaBasedTranscriptSelector = dom.usedAria;
  return ctx;
};

const applyTranscriptStyle = async (ctx: PipelineContext): Promise<PipelineContext> => {
  if (ctx.transcriptContainer) {
    setOpacity(
      ctx.transcriptContainer,
      ctx.canUseAriaBasedTranscriptSelector,
      appConfig.Extension.transcriptStyles.opacity
    );
  }
  return ctx;
};

const observeTranscriptContainer = async (ctx: PipelineContext): Promise<PipelineContext> => {
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

const finalizeMeetingRoutines = async (ctx: PipelineContext): Promise<PipelineContext> => {
  endMeetingRoutines();
  return ctx;
};

async function startMeetingRoutines(): Promise<void> {
  try {
    appConfig = await configService.getConfig();
    await waitForMatch(appConfig.Extension.meetingEndIcon.selector, appConfig.Extension.meetingEndIcon.text);
  } catch (error) {
    console.error("Failed to detect meeting start:", error);
  }
}

export function startPipeline() {
  return pipeAsync<PipelineContext>(
    {
      hasMeetingStarted: true
    } as PipelineContext,
    activateCaptions,
    findTranscriptContainer,
    applyTranscriptStyle,
    observeTranscriptContainer,
    finalizeMeetingRoutines
  );
}

startMeetingRoutines()
  .then(async () => {
    ChatPanel.createPanel(appConfig.Service.direction);
    ChatPanel.addParticipant(appConfig.Service.fullName);

    document.getElementById("au5-start-button")?.addEventListener("click", () => {
      ChatPanel.hideParticipantList();
      startPipeline();
      window.postMessage(
        {
          source: MeetingHubConfig.messageSources.contentScript,
          action: MeetingHubConfig.contentScriptActions.TRANSCRIPTION_STARTED,
          payload: {
            userid: appConfig.Service.userId
          }
        },
        "*"
      );
    });

    injectScript("injected.js");
  })
  .catch(error => {
    console.error("Meeting routine execution failed:", error);
  });

function createMutationHandler(ctx: PipelineContext) {
  return function (mutations: MutationRecord[], observer: MutationObserver) {
    handleTranscriptMutations(mutations, ctx);
  };
}

function handleTranscriptMutations(mutations: MutationRecord[], ctx: PipelineContext): void {
  for (const _ of mutations) {
    try {
      const transcriptContainer = ctx.canUseAriaBasedTranscriptSelector
        ? selectSingle(appConfig.Extension.transcriptSelectors.aria)
        : selectSingle(appConfig.Extension.transcriptSelectors.fallback);

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
          if (textDiff < -appConfig.Extension.maxTranscriptLength) {
            flushTranscriptBuffer({
              id: currentSpeakerId,
              speaker: currentSpeakerName,
              transcript: currentTranscript,
              timestamp: currentTimestamp
            } as TranscriptBlock);
          }
        }

        currentTranscript = transcriptText;
        if (!ctx.canUseAriaBasedTranscriptSelector && transcriptText.length > appConfig.Extension.maxTranscriptLength) {
          latestSpeakerElement.remove();
        }
      }

      ChatPanel.updateLiveMessage({
        id: currentSpeakerId,
        speaker: currentSpeakerName,
        transcript: currentTranscript,
        timestamp: currentTimestamp
      });
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
  const name = item.speaker === "You" ? appConfig.Service.fullName : item.speaker;
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
    const elements = selectAll(appConfig.Extension.meetingEndIcon.selector, appConfig.Extension.meetingEndIcon.text);
    const meetingEndButton = elements?.[0]?.parentElement?.parentElement ?? null;

    if (!meetingEndButton) {
      throw new Error("Meeting end button not found in DOM.");
    }

    meetingEndButton.addEventListener("click", () => {
      hasMeetingEnded = true;
      transcriptObserver?.disconnect();
      //chatMessagesObserver?.disconnect();
      if (currentSpeakerName && currentTranscript) {
        flushTranscriptBuffer({
          speaker: currentSpeakerName,
          transcript: currentTranscript,
          timestamp: currentTimestamp
        } as TranscriptBlock);
      }
      ChatPanel.destroy();
      console.log("Meeting ended. Transcript data:", JSON.stringify(transcriptBlocks));
    });
  } catch (err) {
    console.error("Error setting up meeting end listener:", err);
  }
}

window.addEventListener("message", event => {
  const {data, source} = event;

  // Validate source
  if (source !== window || data?.source !== MeetingHubConfig.messageSources.injectedScript) {
    return;
  }

  const {action, payload} = data;

  switch (action) {
    case MeetingHubConfig.contentScriptActions.TRANSCRIPTION_UPDATE:
      ChatPanel.updateLiveMessage(payload);
      break;

    case MeetingHubConfig.contentScriptActions.PARTICIPANT_JOINED:
      ChatPanel.addParticipant(payload);
      break;

    case MeetingHubConfig.contentScriptActions.TRANSCRIPTION_STARTED:
      ChatPanel.hideParticipantList();
      break;

    default:
      console.warn("Unknown message action received:", action);
  }
});
