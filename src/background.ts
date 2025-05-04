import {ChatMessage, ExtensionMessage, ExtensionResponse, Meeting, ResultLocal, TranscriptBlock} from "./types";

/** Time format options for formatting timestamps */
const timeFormat: Intl.DateTimeFormatOptions = {
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  hour12: true
};

function processLastMeeting(): Promise<string> {
  return new Promise((resolve, reject) => {
    pickupLastMeetingFromStorage()
      .then(() => {
        chrome.storage.local.get(["meetings"], resultLocalUntyped => {
          const resultLocal = resultLocalUntyped as ResultLocal;
          chrome.storage.sync.get(["webhookUrl", "autoPostWebhookAfterMeeting"], resultSyncUntyped => {
            const resultSync = resultSyncUntyped as ResultSync;

            const promises: Promise<any>[] = [];
            const lastIndex = resultLocal.meetings.length - 1;

            promises.push(
              downloadTranscript(
                lastIndex,
                resultSync.webhookUrl && resultSync.autoPostWebhookAfterMeeting ? true : false
              )
            );

            if (resultSync.autoPostWebhookAfterMeeting && resultSync.webhookUrl) {
              promises.push(postTranscriptToWebhook(lastIndex));
            }

            Promise.all(promises)
              .then(() => {
                resolve("Meeting processing and download/webhook posting complete");
              })
              .catch(error => {
                console.error("Operation failed:", error);
                reject(error);
              });
          });
        });
      })
      .catch(error => {
        reject(error);
      });
  });
}

function pickupLastMeetingFromStorage(): Promise<string> {
  return new Promise((resolve, reject) => {
    chrome.storage.local.get(["meetingTitle", "meetingStartTimestamp", "transcript", "chatMessages"], resultUntyped => {
      const result = resultUntyped as ResultLocal;

      if (result.meetingStartTimestamp) {
        if (result.transcript.length > 0 || result.chatMessages.length > 0) {
          const newMeetingEntry: Meeting = {
            meetingTitle: result.meetingTitle,
            meetingStartTimestamp: result.meetingStartTimestamp,
            meetingEndTimestamp: new Date().toISOString(),
            transcript: result.transcript,
            chatMessages: result.chatMessages,
            webhookPostStatus: "new"
          };

          chrome.storage.local.get(["meetings"], resultLocalUntyped => {
            const resultLocal = resultLocalUntyped as ResultLocal;
            let meetings = resultLocal.meetings || [];
            meetings.push(newMeetingEntry);

            if (meetings.length > 10) {
              meetings = meetings.slice(-10);
            }

            chrome.storage.local.set({meetings}, () => {
              console.log("Last meeting picked up");
              resolve("Last meeting picked up");
            });
          });
        } else {
          reject(new Error("Empty transcript and empty chatMessages"));
        }
      } else {
        reject(new Error("No meetings found. May be attend one?"));
      }
    });
  });
}

/**
 * @param {number} index
 * @param {boolean} isWebhookEnabled
 */
function downloadTranscript(index: number, isWebhookEnabled: boolean): Promise<string> {
  return new Promise((resolve, reject) => {
    chrome.storage.local.get(["meetings"], function (resultLocalUntyped) {
      const resultLocal = /** @type {ResultLocal} */ resultLocalUntyped;

      if (resultLocal.meetings && resultLocal.meetings[index]) {
        const meeting = resultLocal.meetings[index];

        // Sanitise meeting title to prevent invalid file name errors
        // https://stackoverflow.com/a/78675894
        const invalidFilenameRegex =
          /[:?"*<>|~/\\\u{1}-\u{1f}\u{7f}\u{80}-\u{9f}\p{Cf}\p{Cn}]|^[.\u{0}\p{Zl}\p{Zp}\p{Zs}]|[.\u{0}\p{Zl}\p{Zp}\p{Zs}]$|^(CON|PRN|AUX|NUL|COM[1-9]|LPT[1-9])(?=\.|$)/giu;
        let sanitisedMeetingTitle = "Google Meet call";
        if (meeting.meetingTitle) {
          sanitisedMeetingTitle = meeting.meetingTitle.replaceAll(invalidFilenameRegex, "_");
        } else if (meeting.title) {
          sanitisedMeetingTitle = meeting.title.replaceAll(invalidFilenameRegex, "_");
        }

        // Format timestamp for human-readable filename and sanitise to prevent invalid filenames
        const timestamp = new Date(meeting.meetingStartTimestamp);
        const formattedTimestamp = timestamp.toLocaleString("default", timeFormat).replace(/[\/:]/g, "-");

        const fileName = `TranscripTonic/Transcript-${sanitisedMeetingTitle} at ${formattedTimestamp}.txt`;

        // Format transcript and chatMessages content
        let content = getTranscriptString(meeting.transcript);
        content += `\n\n---------------\nCHAT MESSAGES\n---------------\n\n`;
        content += getChatMessagesString(meeting.chatMessages);

        // Add branding
        content += "\n\n---------------\n";
        content +=
          "Transcript saved using TranscripTonic Chrome extension (https://chromewebstore.google.com/detail/ciepnfnceimjehngolkijpnbappkkiag)";
        content += "\n---------------";

        const blob = new Blob([content], {type: "text/plain"});

        // Read the blob as a data URL
        const reader = new FileReader();

        // Read the blob
        reader.readAsDataURL(blob);

        // Download as text file, once blob is read
        reader.onload = function (event) {
          if (event.target?.result) {
            const dataUrl = event.target.result;

            // Create a download with Chrome Download API
            chrome.downloads
              .download({
                // @ts-ignore
                url: dataUrl,
                filename: fileName,
                conflictAction: "uniquify"
              })
              .then(() => {
                console.log("Transcript downloaded");
                resolve("Transcript downloaded successfully");

                // Increment anonymous transcript generated count to a Google sheet
                fetch(
                  `https://script.google.com/macros/s/AKfycbw4wRFjJcIoC5uDfscITSjNtUj83JVrBXKn44u9Cs0BoKNgyvt0A5hmG-xsJnlhfVu--g/exec?version=${
                    chrome.runtime.getManifest().version
                  }&isWebhookEnabled=${isWebhookEnabled}`,
                  {
                    mode: "no-cors"
                  }
                );
              })
              .catch(err => {
                console.error(err);
                chrome.downloads.download({
                  // @ts-ignore
                  url: dataUrl,
                  filename: "TranscripTonic/Transcript.txt",
                  conflictAction: "uniquify"
                });
                console.log(
                  "Invalid file name. Transcript downloaded to TranscripTonic directory with simple file name."
                );
                resolve("Transcript downloaded successfully with default file name");

                // Logs anonymous errors to a Google sheet for swift debugging
                fetch(
                  `https://script.google.com/macros/s/AKfycbw4wRFjJcIoC5uDfscITSjNtUj83JVrBXKn44u9Cs0BoKNgyvt0A5hmG-xsJnlhfVu--g/exec?version=${
                    chrome.runtime.getManifest().version
                  }&code=009&error=${encodeURIComponent(err)}`,
                  {mode: "no-cors"}
                );
                // Increment anonymous transcript generated count to a Google sheet
                fetch(
                  `https://script.google.com/macros/s/AKfycbzUk-q3N8_BWjwE90g9HXs5im1pYFriydKi1m9FoxEmMrWhK8afrHSmYnwYcw6AkH14eg/exec?version=${
                    chrome.runtime.getManifest().version
                  }&isWebhookEnabled=${isWebhookEnabled}`,
                  {
                    mode: "no-cors"
                  }
                );
              });
          } else {
            reject(new Error("Failed to read blob"));
          }
        };
      } else {
        reject(new Error("Meeting at specified index not found"));
      }
    });
  });
}

/**
 * @param {number} index
 */
function postTranscriptToWebhook(index: number) {
  return new Promise((resolve, reject) => {
    // Get webhook URL and meetings
    chrome.storage.local.get(["meetings"], function (resultLocalUntyped) {
      const resultLocal = /** @type {ResultLocal} */ resultLocalUntyped;
      chrome.storage.sync.get(["webhookUrl", "webhookBodyType"], function (resultSyncUntyped) {
        const resultSync = /** @type {ResultSync} */ resultSyncUntyped;

        if (resultSync.webhookUrl) {
          if (resultLocal.meetings || resultLocal.meetings[index]) {
            const meeting = resultLocal.meetings[index];

            /** @type {WebhookBody} */
            let webhookData;
            if (resultSync.webhookBodyType === "advanced") {
              webhookData = {
                meetingTitle: meeting.meetingTitle || meeting.title || "",
                meetingStartTimestamp: new Date(meeting.meetingStartTimestamp).toISOString(),
                meetingEndTimestamp: new Date(meeting.meetingEndTimestamp).toISOString(),
                transcript: meeting.transcript,
                chatMessages: meeting.chatMessages
              };
            } else {
              webhookData = {
                meetingTitle: meeting.meetingTitle || meeting.title || "",
                meetingStartTimestamp: new Date(meeting.meetingStartTimestamp)
                  .toLocaleString("default", timeFormat)
                  .toUpperCase(),
                meetingEndTimestamp: new Date(meeting.meetingEndTimestamp)
                  .toLocaleString("default", timeFormat)
                  .toUpperCase(),
                transcript: getTranscriptString(meeting.transcript),
                chatMessages: getChatMessagesString(meeting.chatMessages)
              };
            }

            // Post to webhook
            fetch(resultSync.webhookUrl, {
              method: "POST",
              headers: {
                "Content-Type": "application/json"
              },
              body: JSON.stringify(webhookData)
            })
              .then(response => {
                if (!response.ok) {
                  throw new Error(`Webhook request failed: ${response.status} ${response.statusText}`);
                }
              })
              .then(() => {
                // Update success status
                resultLocal.meetings[index].webhookPostStatus = "successful";
                chrome.storage.local.set({meetings: resultLocal.meetings}, function () {
                  resolve("Webhook posted successfully");
                });
              })
              .catch(error => {
                console.error(error);
                // Update failure status
                resultLocal.meetings[index].webhookPostStatus = "failed";
                chrome.storage.local.set({meetings: resultLocal.meetings}, function () {
                  // Create notification and open webhooks page
                  chrome.notifications.create(
                    {
                      type: "basic",
                      iconUrl: "icon.png",
                      title: "Could not post webhook!",
                      message: "Click to view status and retry. Check console for more details."
                    },
                    function (notificationId) {
                      // Handle notification click
                      chrome.notifications.onClicked.addListener(function (clickedNotificationId) {
                        if (clickedNotificationId === notificationId) {
                          chrome.tabs.create({url: "meetings.html"});
                        }
                      });
                    }
                  );

                  reject(error);
                });
              });
          } else {
            reject(new Error("Meeting at specified index not found"));
          }
        } else {
          reject(new Error("No webhook URL configured"));
        }
      });
    });
  });
}

/**
 * Format transcript entries into string
 * @param {TranscriptBlock[]} transcript
 */
function getTranscriptString(transcript: TranscriptBlock[]) {
  let transcriptString = "";
  if (transcript.length > 0) {
    transcript.forEach(transcriptBlock => {
      transcriptString += `${transcriptBlock.personName} (${new Date(transcriptBlock.timestamp)
        .toLocaleString("default", timeFormat)
        .toUpperCase()})\n`;
      transcriptString += transcriptBlock.transcriptText;
      transcriptString += "\n\n";
    });
    return transcriptString;
  }
  return transcriptString;
}

/**
 * Format chat messages into string
 * @param {ChatMessage[]} chatMessages
 */
function getChatMessagesString(chatMessages: ChatMessage[]) {
  let chatMessagesString = "";
  if (chatMessages.length > 0) {
    chatMessages.forEach(chatMessage => {
      chatMessagesString += `${chatMessage.personName} (${new Date(chatMessage.timestamp)
        .toLocaleString("default", timeFormat)
        .toUpperCase()})\n`;
      chatMessagesString += chatMessage.chatMessageText;
      chatMessagesString += "\n\n";
    });
  }
  return chatMessagesString;
}

function clearTabIdAndApplyUpdate() {
  chrome.storage.local.set({meetingTabId: null}, function () {
    console.log("Meeting tab id cleared for next meeting");

    // Check if there's a deferred update
    chrome.storage.local.get(["isDeferredUpdatedAvailable"], function (resultLocalUntyped) {
      const resultLocal = /** @type {ResultLocal} */ resultLocalUntyped;

      if (resultLocal.isDeferredUpdatedAvailable) {
        console.log("Applying deferred update");
        chrome.storage.local.set({isDeferredUpdatedAvailable: false}, function () {
          chrome.runtime.reload();
        });
      }
    });
  });
}

function recoverLastMeeting() {
  return new Promise((resolve, reject) => {
    chrome.storage.local.get(["meetings", "meetingStartTimestamp"], function (resultLocalUntyped) {
      const resultLocal = /** @type {ResultLocal} */ resultLocalUntyped;
      // Check if user ever attended a meeting
      if (resultLocal.meetingStartTimestamp) {
        const meetingToDownload = resultLocal.meetings[resultLocal.meetings.length - 1];

        // Last meeting was not processed for some reason. Need to recover that data, process and download it.
        if (!meetingToDownload || resultLocal.meetingStartTimestamp !== meetingToDownload.meetingStartTimestamp) {
          processLastMeeting()
            .then(() => {
              resolve("Recovered last meeting to the best possible extent");
            })
            .catch(error => {
              // Fails if transcript is empty or webhook request fails or user never attended any meetings
              reject(error);
            });
        } else {
          resolve("No recovery needed");
        }
      } else {
        reject("No meetings found. May be attend one?");
      }
    });
  });
}

// chrome.runtime.onMessage.addListener((messageUnTyped: ExtensionMessage, sender, sendResponse) => {
//   const message = messageUnTyped as ExtensionMessage;
//   console.log(message.type);

//   if (message.type === "new_meeting_started") {
//     chrome.tabs.query({active: true, currentWindow: true}, tabs => {
//       const tabId = tabs[0]?.id;
//       if (tabId !== undefined) {
//         chrome.storage.local.set({meetingTabId: tabId}, () => {
//           console.log("Meeting tab id saved");
//         });
//       }
//     });
//   }

//   if (message.type === "meeting_ended") {
//     processLastMeeting().finally(() => {
//       clearTabIdAndApplyUpdate();
//     });
//   }

//   if (message.type === "download_transcript_at_index") {
//     if (typeof message.index === "number" && message.index >= 0) {
//       downloadTranscript(message.index, false)
//         .then(() => {
//           const response: ExtensionResponse = {success: true};
//           sendResponse(response);
//         })
//         .catch(error => {
//           const response: ExtensionResponse = {success: false, message: error.message};
//           sendResponse(response);
//         });
//     } else {
//       const response: ExtensionResponse = {success: false, message: "Invalid index"};
//       sendResponse(response);
//     }
//   }

//   if (message.type === "retry_webhook_at_index") {
//     if (typeof message.index === "number" && message.index >= 0) {
//       postTranscriptToWebhook(message.index)
//         .then(() => {
//           const response: ExtensionResponse = {success: true};
//           sendResponse(response);
//         })
//         .catch(error => {
//           console.error("Webhook retry failed:", error);
//           const response: ExtensionResponse = {success: false, message: error.message};
//           sendResponse(response);
//         });
//     } else {
//       const response: ExtensionResponse = {success: false, message: "Invalid index"};
//       sendResponse(response);
//     }
//   }

//   if (message.type === "recover_last_meeting") {
//     recoverLastMeeting()
//       .then(message => {
//         const response: ExtensionResponse = {success: true, message: message as string};
//         sendResponse(response);
//       })
//       .catch(error => {
//         const response: ExtensionResponse = {success: false, message: error.message};
//         sendResponse(response);
//       });
//   }
//   return true;
// });

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

/**
 * Interface that all message handlers must implement.
 * Provides a mechanism to determine if a handler can process a message
 * and a method to perform the handling logic.
 */
interface MessageHandler {
  canHandle(message: ExtensionMessage): boolean;
  handle(message: ExtensionMessage, sendResponse: (response: ExtensionResponse) => void): void | Promise<void>;
}

/**
 * Handles the "new_meeting_started" message type.
 * Saves the current active tab ID to local Chrome storage under `meetingTabId`.
 */
class MeetingStartedHandler implements MessageHandler {
  canHandle(message: ExtensionMessage): boolean {
    return message.type === "new_meeting_started";
  }

  handle(_: ExtensionMessage): void {
    chrome.tabs.query({active: true, currentWindow: true}, tabs => {
      const tabId = tabs[0]?.id;
      if (tabId !== undefined) {
        chrome.storage.local.set({meetingTabId: tabId}, () => {
          console.log("Meeting tab id saved");
        });
      }
    });
  }
}

/**
 * Handles the "meeting_ended" message type.
 * Processes the last meeting and clears stored tab ID.
 */
class MeetingEndedHandler implements MessageHandler {
  canHandle(message: ExtensionMessage): boolean {
    return message.type === "meeting_ended";
  }

  async handle(): Promise<void> {
    await processLastMeeting();
    clearTabIdAndApplyUpdate();
  }
}

// /**
//  * Handles the "download_transcript_at_index" message type.
//  * Downloads a transcript at the specified index and sends the result back via sendResponse.
//  */
// class DownloadTranscriptHandler implements MessageHandler {
//   canHandle(message: ExtensionMessage): boolean {
//     return message.type === "download_transcript_at_index";
//   }

//   async handle(message: ExtensionMessage, sendResponse: (response: ExtensionResponse) => void): Promise<void> {
//     if (typeof message.index === "number" && message.index >= 0) {
//       try {
//         await downloadTranscript(message.index, false);
//         sendResponse({success: true});
//       } catch (error) {
//         sendResponse({success: false, message: (error as Error).message});
//       }
//     } else {
//       sendResponse({success: false, message: "Invalid index"});
//     }
//   }
// }

/**
 * Handles the "retry_webhook_at_index" message type.
 * Attempts to re-post a transcript to the webhook for the given index and reports success/failure.
 */
// class RetryWebhookHandler implements MessageHandler {
//   canHandle(message: ExtensionMessage): boolean {
//     return message.type === "retry_webhook_at_index";
//   }

//   async handle(message: ExtensionMessage, sendResponse: (response: ExtensionResponse) => void): Promise<void> {
//     if (typeof message.index === "number" && message.index >= 0) {
//       try {
//         await postTranscriptToWebhook(message.index);
//         sendResponse({success: true});
//       } catch (error) {
//         console.error("Webhook retry failed:", error);
//         sendResponse({success: false, message: (error as Error).message});
//       }
//     } else {
//       sendResponse({success: false, message: "Invalid index"});
//     }
//   }
// }

/**
 * Handles the "recover_last_meeting" message type.
 * Tries to recover the last meeting data and responds with the result.
 */
class RecoverLastMeetingHandler implements MessageHandler {
  canHandle(message: ExtensionMessage): boolean {
    return message.type === "recover_last_meeting";
  }

  async handle(_: ExtensionMessage, sendResponse: (response: ExtensionResponse) => void): Promise<void> {
    try {
      const msg = await recoverLastMeeting();
      sendResponse({success: true, message: msg as string});
    } catch (error) {
      sendResponse({success: false, message: (error as Error).message});
    }
  }
}

/**
 * List of all available message handlers using the strategy pattern.
 */
const handlers: MessageHandler[] = [
  new MeetingStartedHandler(),
  new MeetingEndedHandler(),
  // new DownloadTranscriptHandler(),
  // new RetryWebhookHandler(),
  new RecoverLastMeetingHandler()
];

/**
 * Main listener for extension messages.
 * Delegates handling of messages to the appropriate strategy (handler) based on message type.
 */
chrome.runtime.onMessage.addListener((messageUnTyped: ExtensionMessage, sender, sendResponse) => {
  const message = messageUnTyped as ExtensionMessage;

  for (const handler of handlers) {
    if (handler.canHandle(message)) {
      handler.handle(message, sendResponse);
      return true;
    }
  }

  console.warn(`No handler found for message type: ${message.type}`);
  return false;
});
