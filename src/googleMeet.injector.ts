import {ExtensionMessage, ExtensionResponse, ResultLocal} from "./types";

chrome.runtime.onMessage.addListener((messageUnTyped: ExtensionMessage, sender, sendResponse) => {
  const message = messageUnTyped as ExtensionMessage;
  console.log(message.type);

  if (message.type === "new_meeting_started") {
    chrome.tabs.query({active: true, currentWindow: true}, tabs => {
      const tabId = tabs[0]?.id;
      if (tabId !== undefined) {
        chrome.storage.local.set({meetingTabId: tabId}, () => {
          console.log("Meeting tab id saved");
        });
      }
    });
  }

  if (message.type === "meeting_ended") {
    processLastMeeting().finally(() => {
      clearTabIdAndApplyUpdate();
    });
  }

  if (message.type === "download_transcript_at_index") {
    if (typeof message.index === "number" && message.index >= 0) {
      downloadTranscript(message.index, false)
        .then(() => {
          const response: ExtensionResponse = {success: true};
          sendResponse(response);
        })
        .catch(error => {
          const response: ExtensionResponse = {success: false, message: error.message};
          sendResponse(response);
        });
    } else {
      const response: ExtensionResponse = {success: false, message: "Invalid index"};
      sendResponse(response);
    }
  }

  if (message.type === "retry_webhook_at_index") {
    if (typeof message.index === "number" && message.index >= 0) {
      postTranscriptToWebhook(message.index)
        .then(() => {
          const response: ExtensionResponse = {success: true};
          sendResponse(response);
        })
        .catch(error => {
          console.error("Webhook retry failed:", error);
          const response: ExtensionResponse = {success: false, message: error.message};
          sendResponse(response);
        });
    } else {
      const response: ExtensionResponse = {success: false, message: "Invalid index"};
      sendResponse(response);
    }
  }

  if (message.type === "recover_last_meeting") {
    recoverLastMeeting()
      .then(message => {
        const response: ExtensionResponse = {success: true, message: message as string};
        sendResponse(response);
      })
      .catch(error => {
        const response: ExtensionResponse = {success: false, message: error.message};
        sendResponse(response);
      });
  }
  return true;
});

chrome.tabs.onRemoved.addListener(tabId => {
  chrome.storage.local.get(["meetingTabId"], resultLocalUntyped => {
    const resultLocal = resultLocalUntyped as ResultLocal;

    if (tabId === resultLocal.meetingTabId) {
      console.log("Successfully intercepted tab close");

      processLastMeeting().finally(() => {
        clearTabIdAndApplyUpdate();
      });
    }
  });
});

chrome.runtime.onUpdateAvailable.addListener(() => {
  chrome.storage.local.get(["meetingTabId"], resultUntyped => {
    const result = resultUntyped as ResultLocal;

    if (result.meetingTabId) {
      chrome.storage.local.set({isDeferredUpdatedAvailable: true}, () => {
        console.log("Deferred update flag set");
      });
    } else {
      console.log("No active meeting, applying update immediately");
      chrome.runtime.reload();
    }
  });
});
