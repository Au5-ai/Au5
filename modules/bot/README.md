# Au5 Bot

This bot is designed to integrate with platforms like Google Meet, Zoom, and others to transcribe participant speech in real-time. Transcriptions are sent to a server using WebSocket for further processing or storage.

## Features

- Real-time transcription of meeting participants
- Supports multiple platforms (Google Meet, Zoom, etc.)
- Pushes transcriptions to a server via WebSocket
- Configurable meeting settings (language, recording, auto-leave, etc.)

## Usage

### 1. Install Podman

Make sure you have **Podman** installed on your system.  

### 2. Build the Image

Navigate to the root folder of bot module where the dockerfile file is located.
Use the following command to build the image.

```sh
podman build -t au5-bot .
```

### 3. Run a Container for Each Meeting

Use the following command to start a bot for a specific meeting:

```sh
podman run -d --name meeting-code --network=au5 \
    -e MEETING_CONFIG='{
        "hubUrl":"http://au5-backend:1366/meetinghub", // hosted backend module
        "platform":"googleMeet",
        "meetingUrl":"https://meet.google.com/meeting-code,
        "botDisplayName":"Cando",
        "meetId":"meeting-code",
        "language":"fa-IR",
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

Replace the values in `MEETING_CONFIG` as needed for your meeting.

## Notes

- Each meeting should have its own container instance.
- Ensure the server URL and network settings are correct for your environment.
- The bot display name, language, and other settings are customizable.

## Logging

- The default log level is `info`.
- You can change the log level by setting the `PINO_LOG_LEVEL` environment variable.
- Example:

  ```sh
  podman run -e PINO_LOG_LEVEL=debug au5-bot YOURCONFIG
  ```
