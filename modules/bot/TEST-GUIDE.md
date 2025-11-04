# Local Testing Guide for Au5 Bot

This guide explains how to test the bot module locally without Docker to see what's happening in real-time.

## Prerequisites

1. **Node.js** (v18 or higher)
2. **npm** installed
3. **Backend running** (for SignalR hub connection)

## Quick Start

### Option 1: Using PowerShell Script (Recommended for Windows)

1. **Update the configuration:**

   ```powershell
   # Edit test-config.json and replace YOUR_GOOGLE_MEET_URL_HERE with a real Google Meet URL
   notepad test-config.json
   ```

2. **Run the test script:**
   ```powershell
   .\test-local.ps1
   ```

### Option 2: Manual Setup

1. **Install dependencies:**

   ```powershell
   npm install
   ```

2. **Install Playwright browsers:**

   ```powershell
   npx playwright install chromium
   ```

3. **Build the TypeScript code:**

   ```powershell
   npm run build
   ```

4. **Create screenshots directory:**

   ```powershell
   mkdir screenshots
   ```

5. **Set the configuration and run:**
   ```powershell
   $env:MEETING_CONFIG = (Get-Content test-config.json -Raw)
   node dist/index.js
   ```

## What You'll See

When running locally, you'll see:

### 1. **Console Logs** (Real-time)

- Bot startup messages
- Meeting join progress
- Caption enablement steps
- Transcription detection
- Any errors or warnings

### 2. **Screenshots** (When errors occur)

- Location: `c:\git\own\Au5\modules\bot\screenshots\`
- Named with timestamp: `transcript-not-found-<timestamp>.png`
- Shows the browser state when the transcript container isn't found

### 3. **Browser Window** (Optional)

You can modify the code to run in headful mode to see the browser:

Edit `src/common/browser/setup.ts` and change:

```typescript
headless: true; // Change to false
```

## Testing Different Scenarios

### Test with a Real Meeting

1. Create a Google Meet
2. Update `test-config.json` with the meeting URL
3. Run the bot
4. Join the same meeting from another device/browser
5. Start speaking to test transcription

### Test Error Scenarios

1. **Test missing transcript container:**

   - Use an invalid meeting URL
   - Check `screenshots/` folder for diagnostic images

2. **Test caption activation:**

   - Watch console logs for caption enabler steps
   - See retry logic in action

3. **Test large meeting delay:**
   - Join a meeting with multiple participants
   - Observe the 5-second stabilization delay
   - See retry attempts if container isn't ready

## Configuration Options

Edit `test-config.json` to change:

```json
{
  "meetingUrl": "YOUR_MEET_URL", // Required: Google Meet URL
  "botDisplayName": "Test Bot", // Bot's display name
  "language": "en-US", // Caption language
  "delayBeforeInteraction": 5000, // Wait before joining (ms)
  "meeting_settings": {
    "transcription": true, // Enable transcription
    "transcription_model": "liveCaption" // Use live captions
  },
  "autoLeave": {
    "waitingEnter": 300000, // Max wait to be admitted (5 min)
    "noParticipant": 60000, // Leave if no participants (1 min)
    "lastParticipantLeft": 30000 // Leave after last participant (30 sec)
  }
}
```

## Troubleshooting

### Bot doesn't join meeting

- Check if the meeting URL is correct
- Make sure the backend is running at `http://localhost:1366`
- Check if Playwright browsers are installed

### No transcripts appearing

- Verify captions are enabled in the meeting
- Check console logs for caption enabler status
- Look for screenshots in `screenshots/` folder
- Try increasing `CAPTION_UI_STABILIZATION_DELAY` in `src/platforms/google/constants.ts`

### "Connection refused" errors

- Start the backend service first
- Verify backend is listening on port 1366
- Check `hubUrl` in test-config.json

### Screenshots not saving

- Verify the `screenshots/` directory exists and is writable
- Check console logs for file path permissions errors
- On Windows, ensure the path doesn't exceed 260 characters

## Debugging Tips

1. **Enable verbose logging:**
   Check `src/common/utils/logger.ts` for log level settings

2. **Run in headful mode:**
   Set `headless: false` in browser setup to see the browser window

3. **Increase timeouts:**
   Edit `src/platforms/google/constants.ts` to increase wait times

4. **Check screenshot timestamps:**
   Screenshot filenames include timestamps to correlate with logs

5. **Monitor network requests:**
   Use browser DevTools (when headful) to inspect SignalR connections

## After Testing

When you're done testing:

1. Stop the bot with `Ctrl+C`
2. Review logs and screenshots
3. Clean up screenshots if needed:
   ```powershell
   Remove-Item screenshots\* -Force
   ```

## Screenshot Location Summary

- **Local testing**: `c:\git\own\Au5\modules\bot\screenshots\`
- **Docker**: `/app/screenshots/` (mounted to `/var/au5/screenshots/<container-name>/` on host)
