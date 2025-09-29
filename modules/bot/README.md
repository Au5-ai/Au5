# Au5 Bot

This bot is designed to integrate with platforms like Google Meet, Zoom, and others to transcribe participant speech in real-time. Transcriptions are sent to a server using WebSocket for further processing or storage.

## Features

- Real-time transcription of meeting participants
- Supports multiple platforms (Google Meet, Zoom, etc.)
- Pushes transcriptions to a server via WebSocket
- Configurable meeting settings (language, recording, auto-leave, etc.)
- Headless browser automation using Playwright
- Automatic meeting joining and leaving based on participant activity

## Prerequisites

Choose one of the following container runtimes:

### For Docker
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) or Docker Engine
- Docker network: `au5` (created automatically by docker-compose)

### For Podman
- [Podman](https://podman.io/getting-started/installation) v4.0 or higher
- Podman network: `au5` (create with `podman network create au5`)

## Installation & Usage

### Option 1: Using Docker

#### 1. Build the Image
Navigate to the bot module directory and build the image:

```bash
cd modules/bot
docker build -t au5-bot .
```

#### 2. Run a Container for Each Meeting
Use the following command to start a bot for a specific meeting:

```bash
docker run -d --name meeting-code --network au5 \
    -e MEETING_CONFIG='{
        "hubUrl":"http://au5-backend:1366/meetinghub",
        "platform":"googleMeet",
        "meetingUrl":"https://meet.google.com/meeting-code",
        "botDisplayName":"Au5 Bot",
        "meetId":"meeting-code",
        "language":"en-US",
        "autoLeave":{
            "waitingEnter":30000,
            "noParticipant":60000,
            "allParticipantsLeft":120000
        },
        "meeting_settings":{
            "video_recording":true,
            "audio_recording":true,
            "transcription":true,
            "transcription_model":"liveCaption"
        }
    }' au5-bot
```

### Option 2: Using Podman

#### 1. Create Network (if not already created)
```bash
podman network create au5
```

#### 2. Build the Image
Navigate to the bot module directory and build the image:

```bash
cd modules/bot
podman build -t au5-bot .
```

#### 3. Run a Container for Each Meeting
Use the following command to start a bot for a specific meeting:

```bash
podman run -d --name meeting-code --network au5 \
    -e MEETING_CONFIG='{
        "hubUrl":"http://au5-backend:1366/meetinghub",
        "platform":"googleMeet",
        "meetingUrl":"https://meet.google.com/meeting-code",
        "botDisplayName":"Au5 Bot",
        "meetId":"meeting-code",
        "language":"en-US",
        "autoLeave":{
            "waitingEnter":30000,
            "noParticipant":60000,
            "allParticipantsLeft":120000
        },
        "meeting_settings":{
            "video_recording":true,
            "audio_recording":true,
            "transcription":true,
            "transcription_model":"liveCaption"
        }
    }' au5-bot
```

## Configuration

Replace the values in `MEETING_CONFIG` as needed for your meeting. The configuration object supports the following parameters:

### Required Parameters
- `hubUrl`: WebSocket URL of the Au5 backend hub (e.g., `"http://au5-backend:1366/meetinghub"`)
- `platform`: Meeting platform (`"googleMeet"`, `"zoom"`, etc.)
- `meetingUrl`: Full URL of the meeting to join
- `botDisplayName`: Name displayed for the bot in the meeting
- `meetId`: Unique identifier for the meeting session

### Optional Parameters
- `language`: Language code for transcription (default: `"en-US"`, supports `"fa-IR"`, `"es-ES"`, etc.)
- `autoLeave`: Configuration for automatic bot leaving behavior:
  - `waitingEnter`: Time to wait before joining (milliseconds)
  - `noParticipant`: Time to wait with no participants before leaving (milliseconds)
  - `allParticipantsLeft`: Time to wait after all participants leave (milliseconds)
- `meeting_settings`: Recording and transcription settings:
  - `video_recording`: Enable video recording (boolean)
  - `audio_recording`: Enable audio recording (boolean)
  - `transcription`: Enable real-time transcription (boolean)
  - `transcription_model`: Transcription model to use (`"liveCaption"`, etc.)

### Example Configuration
```json
{
  "hubUrl": "http://au5-backend:1366/meetinghub",
  "platform": "googleMeet",
  "meetingUrl": "https://meet.google.com/abc-def-ghi",
  "botDisplayName": "Au5 Meeting Assistant",
  "meetId": "meeting-abc-def-ghi",
  "language": "en-US",
  "autoLeave": {
    "waitingEnter": 30000,
    "noParticipant": 60000,
    "allParticipantsLeft": 120000
  },
  "meeting_settings": {
    "video_recording": true,
    "audio_recording": true,
    "transcription": true,
    "transcription_model": "liveCaption"
  }
}
```

## Container Management

### Managing Bot Containers

**Docker:**
```bash
# List running bots
docker ps --filter "ancestor=au5-bot"

# Stop a specific bot
docker stop meeting-code

# Remove a specific bot container
docker rm meeting-code

# View bot logs
docker logs meeting-code -f
```

**Podman:**
```bash
# List running bots
podman ps --filter "ancestor=au5-bot"

# Stop a specific bot
podman stop meeting-code

# Remove a specific bot container
podman rm meeting-code

# View bot logs
podman logs meeting-code -f
```

## Logging

The bot uses Pino for structured logging. You can control the logging level:

- **Default log level**: `info`
- **Available levels**: `trace`, `debug`, `info`, `warn`, `error`, `fatal`

### Setting Log Level

**Docker:**
```bash
docker run -d --name meeting-code --network au5 \
    -e PINO_LOG_LEVEL=debug \
    -e MEETING_CONFIG='...' \
    au5-bot
```

**Podman:**
```bash
podman run -d --name meeting-code --network au5 \
    -e PINO_LOG_LEVEL=debug \
    -e MEETING_CONFIG='...' \
    au5-bot
```

## Notes

- Each meeting should have its own container instance
- Ensure the Au5 backend is running and accessible at the specified `hubUrl`
- The bot requires network access to the meeting platform (Google Meet, Zoom, etc.)
- Container names should be unique for each meeting session
- The bot automatically handles browser lifecycle and cleanup

## Troubleshooting

### Common Issues

1. **Bot fails to join meeting**:
   - Verify the meeting URL is correct and accessible
   - Check network connectivity to the meeting platform
   - Ensure the bot has the necessary permissions

2. **Connection to backend fails**:
   - Verify the `hubUrl` is correct and the backend is running
   - Check that both bot and backend are on the same network (`au5`)
   - Review backend logs for connection issues

3. **Transcription not working**:
   - Verify `transcription` is set to `true` in meeting_settings
   - Check that the specified language is supported
   - Review bot logs for transcription errors

### Log Analysis
```bash
# View real-time logs
docker logs meeting-code -f

# Search for specific errors
docker logs meeting-code 2>&1 | grep -i error

# Export logs to file
docker logs meeting-code > bot-logs.txt 2>&1
```
