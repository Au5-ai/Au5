![High Level Design](docs/au5-hld.png)

> [!WARNING]
> This software has not received external security review and may contain vulnerabilities and may not necessarily meet its stated security goals. Do not use it for sensitive use cases, and do not rely on its security until it has been reviewed. Work in progress.

# Au5 Bot

This bot is designed to integrate with platforms like Google Meet, Zoom, and others to transcribe participant speech in real-time. Transcriptions are sent to a server using WebSocket for further processing or storage.

## Features

- Real-time transcription of meeting participants
- Supports multiple platforms (Google Meet, Zoom, etc.)
- Pushes transcriptions to a server via WebSocket
- Configurable meeting settings (language, recording, auto-leave, etc.)

  https://github.com/Au5-ai/Au5/tree/main/modules/bot

# Au5 Backend

## Start SqlServer

docker run --network=au5 -e "ACCEPT_EULA=Y" -e "SA_PASSWORD=!qaz@wsx" -p 1433:1433 --name sqlserver -d mcr.microsoft.com/mssql/server:2022-lts

## 🔌 Redis Setup (with Docker or Podman)

This project uses Redis for caching or other services. If you don't have a Redis instance running already, you can start one using Docker or Podman.

### Start Redis Container

**Using Docker:**

```bash
docker run -d --name redis -p 6379:6379 redis
```

**Using Podman:**

```bash
podman run -d --name redis -p 6379:6379 docker.io/library/redis
```

This will run a Redis container accessible at localhost:6379.

🛠️ Configuration Notes

The application is set up to connect to Redis at:

```bash
localhost:6379
```

If you are running Redis on a different host or port or
using a Docker network or a cloud Redis provider (like Azure Redis, AWS ElastiCache, etc.),

👉 You must update your Redis connection string in your configuration file:

```bash
  "ConnectionStrings": {
    "Redis": "localhost:6379"
}
```

# Au5 Extension

# Au5 Captain

# Au5 Panel
