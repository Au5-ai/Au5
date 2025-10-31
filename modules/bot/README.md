# Au5 Bot

This bot is designed to integrate with platforms like Google Meet, Zoom, and others to transcribe participant speech in real-time. Transcriptions are sent to a server using WebSocket for further processing or storage.

## Features

- Real-time transcription of meeting participants
- Supports multiple platforms (Google Meet, Zoom, etc.)
- Pushes transcriptions to a server via WebSocket
- Configurable meeting settings (language, recording, auto-leave, etc.)
- Headless browser automation using Playwright
- Automatic meeting joining and leaving based on participant activity

## 📊 **Analysis: Google Meet Caption Enabling, Mutation Observation & SignalR Integration**

### **Architecture Overview**

The system follows a **3-stage pipeline**:

1. **Caption Enablement** → Enable Google Meet's native live captions
2. **DOM Mutation Observation** → Monitor caption blocks in real-time
3. **SignalR Broadcasting** → Send transcriptions to the backend hub

---

## **1️⃣ Caption Enablement Flow** (`CaptionEnabler`)

### **Purpose**

Programmatically activates Google Meet's built-in live captions and sets the desired language.

### **Key Steps**

```typescript
activate(languageValue: string)
  ↓
1. dismissOverlayIfPresent()          // Remove any blocking dialogs
  ↓
2. findTurnOnCaptionButton()          // Locate "closed_caption_off" button
  ↓
3. activateLanguageDropdownOverlay()  // Make language selector visible
  ↓
4. clickLanguageDropdown()            // Open language combobox
  ↓
5. selectLanguageOption(languageValue) // Select specific language (e.g., "en-US")
```

### **Technical Approach**

- **DOM Manipulation**: Uses Playwright to interact with Google Meet's UI elements
- **Retry Logic**: Multiple fallback selectors for robustness (`.NmXUuc.P9KVBf.IGXezb`, attribute selectors)
- **Visibility Control**: Forces overlay visibility with `style.opacity = "1"` and `style.pointerEvents = "auto"`
- **Language Selection**: Targets `[role="option"][data-value="${languageValue}"]` for precise language choice

### **Configuration**

```typescript
Google_Caption_Configuration = {
  language: "en-US", // Set from config.language
  transcriptSelectors: {
    aria: 'div[role="region"][tabindex="0"]',
    fallback: ".a4cQT",
  },
};
```

---

## **2️⃣ Caption Mutation Observation** (`CaptionMutationHandler`)

### **Purpose**

Monitors the Google Meet transcript container for new/updated caption blocks and extracts speaker + transcript data.

### **Data Flow**

```typescript
observe(pushToHub)
  ↓
1. findTranscriptContainer()
   → Uses CaptionProcessor.getCaptionContainer()
   → Tries ARIA selector first, falls back to class selector
  ↓
2. observeTranscriptContainer()
   → Injects browser-side MutationObserver
   → Watches: childList, subtree, attributes, characterData
  ↓
3. On DOM mutation:
   → processBlock(element)
   → extractCaptionData()
     - blockId: UUID assigned to each caption block
     - speakerName: From <span> element
     - pictureUrl: From <img src="">
     - transcript: From text-only <div>
  ↓
4. Deduplication:
   → Compare with previousTranscripts[blockId]
   → Only emit if transcript changed
  ↓
5. Callback:
   → pushToHub(EntryMessage)
```

### **Key Techniques**

#### **Playwright-Browser Bridge**

```typescript
// Node.js side (Playwright context)
await this.page.exposeFunction(
  "handleTranscription",
  async (caption: Caption) => {
    pushToHub({
      /* EntryMessage */
    });
  }
);

// Browser side (injected JavaScript)
window.handleTranscription(blockTranscription); // Calls back to Node.js
```

#### **MutationObserver Configuration**

```javascript
observer.observe(element, {
  childList: true, // New caption blocks added
  subtree: true, // Monitor all descendants
  attributes: true, // Attribute changes (rare but possible)
  characterData: true, // Text node updates (speaker still talking)
});
```

#### **Caption Block Structure**

Google Meet's DOM for captions:

```html
<div data-blockid="uuid">
  <img src="profile-pic.jpg" />
  <!-- pictureUrl -->
  <span>John Doe</span>
  <!-- speakerName -->
  <div>Hello everyone...</div>
  <!-- transcript -->
</div>
```

#### **Deduplication Strategy**

```typescript
private previousTranscripts: Record<string, string> = {};

if (this.previousTranscripts[caption.blockId] === caption.transcript) {
  return; // Skip duplicate
}
this.previousTranscripts[caption.blockId] = caption.transcript;
```

---

## **3️⃣ SignalR Hub Integration** (`MeetingHubClient`)

### **Purpose**

Establishes real-time WebSocket connection to backend and broadcasts transcription entries.

### **Connection Setup**

```typescript
constructor(config: MeetingConfiguration) {
  this.connection = new signalR.HubConnectionBuilder()
    .withUrl(config.hubUrl) // e.g., "http://au5-backend:1366/meetinghub"
    .withAutomaticReconnect()
    .build();
}

public async startConnection(): Promise<boolean> {
  await this.connection.start();
  await this.connection.invoke("BotJoinedInMeeting", this.config.meetId);
}
```

### **Message Transmission**

```typescript
public async sendMessage(payload: EntryMessage): Promise<void> {
  await this.connection.invoke(payload.type, payload);
  //                            ↑ "Entry"   ↑ EntryMessage object
}
```

### **EntryMessage Schema**

```typescript
interface EntryMessage {
  meetId: string; // Unique meeting identifier
  blockId: string; // UUID for this caption block
  participant: {
    fullName: string; // Speaker name
    pictureUrl: string; // Speaker avatar
  };
  content: string; // Actual transcript text
  timestamp: Date; // When caption was captured
  entryType: "Transcription";
  type: "Entry"; // Type of Message
}
```

### **Backend Hub Handler** (C#)

```csharp
public async Task Entry(EntryMessage transcription) {
  var canBroadcast = await meetingService.UpsertBlock(transcription);
  if (canBroadcast) {
    await BroadcastToGroupExceptCallerAsync(
      transcription.MeetId,
      transcription
    );
  }
}
```

---

## **4️⃣ Complete Integration Flow**

```
┌─────────────────────────────────────────────────────────────────┐
│ GoogleMeet.observeTranscriptions(handler)                       │
│   ↓                                                             │
│   if (transcription && transcription_model === "liveCaption")   │
│   ↓                                                             │
│   CaptionEnabler.activate(language)                             │
│   ↓                                                             │
│   CaptionMutationHandler.observe(handler)                       │
└─────────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────────┐
│ Browser: MutationObserver detects caption change                │
│   ↓                                                             │
│   extractCaptionData(block) → Caption object                    │
│   ↓                                                             │
│   window.handleTranscription(caption) [Playwright bridge]       │
└─────────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────────┐
│ Node.js: handleTranscription callback                           │
│   ↓                                                             │
│   Deduplication check (previousTranscripts)                     │
│   ↓                                                             │
│   Build EntryMessage                                            │
│   ↓                                                             │
│   pushToHub(EntryMessage)                                       │
└─────────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────────┐
│ BotManager.handleTranscription                                  │
│   ↓                                                             │
│   message.meetId = meetingConfig.meetId                         │
│   ↓                                                             │
│   if (!meetingHasPaused)                                        │
│     hubClient.sendMessage(message)                              │
└─────────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────────┐
│ SignalR: connection.invoke("Entry", EntryMessage)               │
│   ↓                                                             │
│   WebSocket → Backend MeetingHub                                │
│   ↓                                                             │
│   MeetingHub.Entry(transcription)                               │
│   ↓                                                             │
│   meetingService.UpsertBlock(transcription) // Save to DB       │
│   ↓                                                             │
│   BroadcastToGroupExceptCallerAsync() // Notify other clients   │
└─────────────────────────────────────────────────────────────────┘
```

---

## **5️⃣ Strengths & Potential Issues**

### **✅ Strengths**

1. **Robust Selector Strategy**: Multiple fallbacks for finding caption container
2. **Deduplication**: Prevents sending duplicate transcripts for the same block
3. **Auto-Reconnect**: SignalR automatically handles connection drops
4. **Pause/Resume**: `meetingHasPaused` flag stops transmission without disconnecting

### **⚠️ Potential Issues**

#### **Issue 1: Missing `meetId` in EntryMessage**

```typescript
// In captionMutationHandler.ts line 62
pushToHub({
  blockId: caption.blockId,
  // ...
  meetId: "", // ❌ Empty string!
  // ...
} as EntryMessage);
```

**Fix**: Should be set from `config.meetId` before sending

#### **Issue 2: Race Condition in Observer Setup**

```typescript
// Page function exposed AFTER observer starts
await this.page.exposeFunction("handleTranscription", ...);
await this.page.evaluate(() => { /* MutationObserver */ });
```

If mutations occur during the gap, `window.handleTranscription` might be undefined.

#### **Issue 3: No Error Handling in Browser Context**

```javascript
// In browser-side code
window.handleTranscription(blockTranscription); // No try-catch
```

If the Playwright bridge fails, errors are silently swallowed.

#### **Issue 4: Memory Leak in `previousTranscripts`**

```typescript
private previousTranscripts: Record<string, string> = {};
```

This grows indefinitely. Long meetings could accumulate thousands of entries.

**Suggested Fix**:

```typescript
// Keep only last 100 blocks
if (Object.keys(this.previousTranscripts).length > 100) {
  const oldestKey = Object.keys(this.previousTranscripts)[0];
  delete this.previousTranscripts[oldestKey];
}
```

---

## **6️⃣ Configuration Requirements**

For this to work, the config must include:

```json
{
  "meeting_settings": {
    "transcription": true,
    "transcription_model": "liveCaption" // Not "liveVoice"
  },
  "language": "en-US",
  "hubUrl": "http://au5-backend:1366/meetinghub",
  "meetId": "meet-abc-123"
}
```

---

## **Summary**

This is a well-architected system that:

1. **Programmatically enables** Google Meet's native captions
2. **Observes DOM mutations** to capture real-time transcription updates
3. **Deduplicates** repeated transcripts using block IDs
4. **Bridges** browser context to Node.js via Playwright's `exposeFunction`
5. **Transmits** via SignalR to a .NET backend hub
6. **Broadcasts** to all meeting participants in real-time

The main areas for improvement are error handling, memory management, and ensuring `meetId` is properly populated in all messages.
