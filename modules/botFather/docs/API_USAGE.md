# Container API Usage

## Create Container Endpoint

**Endpoint**: `POST /create-container`

**Description**: Creates and starts a Docker container with environment variables based on the provided meeting configuration.

### Request Body

Send a JSON object with the following structure:

```json
{
  "hubUrl": "http://au5-backend:1366/meetinghub",
  "platform": "googleMeet",
  "meetingUrl": "https://meet.google.com/dzc-awqw-ioi",
  "botDisplayName": "Cando",
  "meetId": "dzc-awqw-ioi",
  "hashToken": "abc123",
  "language": "fa-IR",
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

### Response

On success, returns a JSON object:

```json
{
  "container_id": "abc123def456",
  "message": "Container created and started successfully",
  "meeting_config": {
    // echoed meeting config object
  }
}
```

### Environment Variables Set in Container

The meeting configuration is passed as a single JSON string in the `MEETING_CONFIG` environment variable. This allows the containerized application to parse the entire configuration at once.

Example environment variable value:

```
MEETING_CONFIG={"hubUrl":"http://au5-backend:1366/meetinghub","platform":"googleMeet","meetingUrl":"https://meet.google.com/dzc-awqw-ioi","botDisplayName":"Cando","meetId":"dzc-awqw-ioi","hashToken":"abc123","language":"fa-IR","autoLeave":{"waitingEnter":30000,"noParticipant":60000,"allParticipantsLeft":120000},"meeting_settings":{"video_recording":true,"audio_recording":true,"transcription":true,"transcription_model":"liveCaption"}}
```

### Example cURL Command

```bash
curl -X POST http://localhost:8080/create-container \
  -H "Content-Type: application/json" \
  -d '{
    "hubUrl": "http://au5-backend:1366/meetinghub",
    "platform": "googleMeet",
    "meetingUrl": "https://meet.google.com/dzc-awqw-ioi",
    "botDisplayName": "Cando",
    "meetId": "dzc-awqw-ioi",
    "hashToken": "abc123",
    "language": "fa-IR",
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
  }'
```

## Remove Container Endpoint

**Endpoint**: `POST /remove-container`

**Description**: Finds and removes a Docker container based on the provided meetId and hashToken. The container is first stopped (if running) and then removed.

### Request Body

Send a JSON object with the following structure:

```json
{
  "meetId": "dzc-awqw-ioi",
  "hashToken": "abc123"
}
```

### Response

On success, returns a JSON object:

```json
{
  "container_id": "abc123def456",
  "message": "Container stopped and removed successfully",
  "meetId": "dzc-awqw-ioi",
  "hashToken": "abc123"
}
```

### Error Responses

- **404 Not Found**: If no container is found with the provided meetId and hashToken
- **400 Bad Request**: If meetId or hashToken is missing from the request
- **500 Internal Server Error**: If there's an error with Docker operations

### Example cURL Command

```bash
curl -X POST http://localhost:8081/remove-container \
  -H "Content-Type: application/json" \
  -d '{
    "meetId": "dzc-awqw-ioi",
    "hashToken": "abc123"
  }'
```
