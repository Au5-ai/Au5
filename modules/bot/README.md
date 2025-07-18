# Au5 Bot

This bot is designed to integrate with platforms like Google Meet, Zoom, and others to transcribe participant speech in real-time. Transcriptions are sent to a server using WebSocket for further processing or storage.

## Features

- Real-time transcription of meeting participants
- Supports multiple platforms (Google Meet, Zoom, etc.)
- Pushes transcriptions to a server via WebSocket
- Configurable meeting settings (language, recording, auto-leave, etc.)

## Usage

### 1. Build the Docker Image

```sh
docker build -t au5-bot .
```

### 2. Run a Container for Each Meeting

Use the following command to start a bot for a specific meeting:

```sh
podman run -d --name dzc-awqw-ioi --network=au5 \
    -e MEETING_CONFIG='{
        "hubUrl":"http://au5-backend:1366/meetinghub", // hosted backend module
        "platform":"googleMeet",
        "meetingUrl":"https://meet.google.com/dzc-afsw-edd",
        "botDisplayName":"Cando",
        "meetId":"dzc-afsw-edd",
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
