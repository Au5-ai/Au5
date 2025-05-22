let appConfig;
const configService = new ConfigurationService(new StorageService());
let hasMeetingEnded = false;
let transcriptBlocks = [];
let currentSpeakerId = "", currentSpeakerName = "", currentTranscript = "", currentTimestamp = "";
let transcriptObserver;
const activateCaptions = async (ctx) => {
  var _a;
  const captionsIcon = appConfig.Extension.captionsIcon;
  ctx.captionsButton = selectAll(captionsIcon.selector, captionsIcon.text)[0];
  (_a = ctx.captionsButton) == null ? void 0 : _a.click();
  return ctx;
};
const findTranscriptContainer = async (ctx) => {
  const dom = getDomContainer(
    appConfig.Extension.transcriptSelectors.aria,
    appConfig.Extension.transcriptSelectors.fallback
  );
  if (!dom) throw new Error("Transcript container not found in DOM");
  ctx.transcriptContainer = dom.container;
  ctx.canUseAriaBasedTranscriptSelector = dom.usedAria;
  return ctx;
};
const applyTranscriptStyle = async (ctx) => {
  if (ctx.transcriptContainer) {
    setOpacity(
      ctx.transcriptContainer,
      ctx.canUseAriaBasedTranscriptSelector,
      appConfig.Extension.transcriptStyles.opacity
    );
  }
  return ctx;
};
const observeTranscriptContainer = async (ctx) => {
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
const finalizeMeetingRoutines = async (ctx) => {
  endMeetingRoutines();
  return ctx;
};
async function startMeetingRoutines() {
  try {
    appConfig = await configService.getConfig();
    await waitForMatch(appConfig.Extension.meetingEndIcon.selector, appConfig.Extension.meetingEndIcon.text);
  } catch (error) {
    console.error("Failed to detect meeting start:", error);
  }
}
function startPipeline() {
  return pipeAsync(
    {
      hasMeetingStarted: true
    },
    activateCaptions,
    findTranscriptContainer,
    applyTranscriptStyle,
    observeTranscriptContainer,
    finalizeMeetingRoutines
  );
}
function getMeetingTitleFromUrl() {
  const url = new URL(window.location.href);
  const pathSegments = url.pathname.split("/").filter(Boolean);
  const meetingId = pathSegments.length > 0 ? pathSegments[pathSegments.length - 1] : "N/A";
  return meetingId;
}
startMeetingRoutines().then(async () => {
  var _a;
  SidePanel.createSidePanel("Asax Co", getMeetingTitleFromUrl(), appConfig.Service.direction);
  injectScript("injected.js");
  (_a = document.getElementById("au5-start-button")) == null ? void 0 : _a.addEventListener("click", () => {
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
}).catch((error) => {
  console.error("Meeting routine execution failed:", error);
});
function createMutationHandler(ctx) {
  return function(mutations, observer) {
    handleTranscriptMutations(mutations, ctx);
  };
}
function handleTranscriptMutations(mutations, ctx) {
  var _a, _b, _c, _d;
  for (const _ of mutations) {
    try {
      const transcriptContainer = ctx.canUseAriaBasedTranscriptSelector ? selectSingle(appConfig.Extension.transcriptSelectors.aria) : selectSingle(appConfig.Extension.transcriptSelectors.fallback);
      const speakerElements = ctx.canUseAriaBasedTranscriptSelector ? transcriptContainer == null ? void 0 : transcriptContainer.children : (_b = (_a = transcriptContainer == null ? void 0 : transcriptContainer.childNodes[1]) == null ? void 0 : _a.firstChild) == null ? void 0 : _b.childNodes;
      if (!speakerElements) return;
      const hasSpeakers = ctx.canUseAriaBasedTranscriptSelector ? speakerElements.length > 1 : speakerElements.length > 0;
      if (!hasSpeakers) {
        if (currentSpeakerName && currentTranscript) {
          flushTranscriptBuffer({
            speaker: currentSpeakerName,
            transcript: currentTranscript,
            timestamp: currentTimestamp
          });
        }
        currentSpeakerId = "";
        currentSpeakerName = "";
        currentTranscript = "";
        continue;
      }
      const latestSpeakerElement = ctx.canUseAriaBasedTranscriptSelector ? speakerElements[speakerElements.length - 2] : speakerElements[speakerElements.length - 1];
      const nameNode = latestSpeakerElement.childNodes[0];
      const textNode = latestSpeakerElement.childNodes[1];
      const speakerName = ((_c = nameNode == null ? void 0 : nameNode.textContent) == null ? void 0 : _c.trim()) ?? "";
      const transcriptText = ((_d = textNode == null ? void 0 : textNode.textContent) == null ? void 0 : _d.trim()) ?? "";
      if (!speakerName || !transcriptText) {
        continue;
      }
      if (currentTranscript === "") {
        currentSpeakerId = crypto.randomUUID();
        currentSpeakerName = speakerName;
        currentTimestamp = (/* @__PURE__ */ new Date()).toISOString();
        currentTranscript = transcriptText;
      } else if (currentSpeakerName !== speakerName) {
        flushTranscriptBuffer({
          id: currentSpeakerId,
          speaker: currentSpeakerName,
          transcript: currentTranscript,
          timestamp: currentTimestamp
        });
        currentSpeakerId = crypto.randomUUID();
        currentSpeakerName = speakerName;
        currentTimestamp = (/* @__PURE__ */ new Date()).toISOString();
        currentTranscript = transcriptText;
      } else {
        if (ctx.canUseAriaBasedTranscriptSelector) {
          const textDiff = transcriptText.length - currentTranscript.length;
          if (textDiff < -appConfig.Extension.maxTranscriptLength) {
            flushTranscriptBuffer({
              id: currentSpeakerId,
              speaker: currentSpeakerName,
              transcript: currentTranscript,
              timestamp: currentTimestamp
            });
          }
        }
        currentTranscript = transcriptText;
        if (!ctx.canUseAriaBasedTranscriptSelector && transcriptText.length > appConfig.Extension.maxTranscriptLength) {
          latestSpeakerElement.remove();
        }
      }
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
function flushTranscriptBuffer(item) {
  if (!currentTranscript || !currentTimestamp) return;
  const name = item.speaker === "You" ? appConfig.Service.fullName : item.speaker;
  transcriptBlocks.push({
    id: item.id,
    speaker: name,
    timestamp: item.timestamp,
    transcript: item.transcript
  });
}
function endMeetingRoutines() {
  var _a, _b;
  try {
    const elements = selectAll(appConfig.Extension.meetingEndIcon.selector, appConfig.Extension.meetingEndIcon.text);
    const meetingEndButton = ((_b = (_a = elements == null ? void 0 : elements[0]) == null ? void 0 : _a.parentElement) == null ? void 0 : _b.parentElement) ?? null;
    if (!meetingEndButton) {
      throw new Error("Meeting end button not found in DOM.");
    }
    meetingEndButton.addEventListener("click", () => {
      hasMeetingEnded = true;
      transcriptObserver == null ? void 0 : transcriptObserver.disconnect();
      if (currentSpeakerName && currentTranscript) {
        flushTranscriptBuffer({
          speaker: currentSpeakerName,
          transcript: currentTranscript,
          timestamp: currentTimestamp
        });
      }
      SidePanel.destroy();
      console.log("Meeting ended. Transcript data:", JSON.stringify(transcriptBlocks));
    });
  } catch (err) {
    console.error("Error setting up meeting end listener:", err);
  }
}
window.addEventListener("message", (event) => {
  const { data, source } = event;
  if (source !== window || (data == null ? void 0 : data.source) !== MeetingHubConfig.messageSources.injectedScript) {
    return;
  }
  const { action, payload } = data;
  switch (action) {
    case MeetingHubConfig.contentScriptActions.TRANSCRIPTION_UPDATE:
      break;
    case MeetingHubConfig.contentScriptActions.PARTICIPANT_JOINED:
      break;
    case MeetingHubConfig.contentScriptActions.TRANSCRIPTION_STARTED:
      break;
    case MeetingHubConfig.contentScriptActions.MeedHasBeenStarted:
      console.log("Meeting has started");
      SidePanel.showMessagesContainer();
      break;
    default:
      console.warn("Unknown message action received:", action);
  }
});
