# Au5 - AI-Powered Meeting Assistant Platform

> [!WARNING]
> This software has not received external security review and may contain vulnerabilities and may not necessarily meet its stated security goals. Do not use it for sensitive use cases, and do not rely on its security until it has been reviewed. Work in progress.

Au5 is a comprehensive AI-powered meeting assistant platform that provides real-time transcription, AI analysis, and meeting management capabilities. The platform consists of multiple microservices that work together to deliver a seamless meeting experience.

## 🏗️ Architecture Overview

The Au5 platform consists of the following modules:

- **Backend** (.NET 9): Core API and business logic with SignalR hubs
- **Panel** (Next.js): Web-based admin panel and user interface  
- **Bot** (Node.js/TypeScript): Meeting bot for joining and transcribing meetings
- **BotFather** (Go): Container orchestration service for managing bot instances
- **AI Engine** (Python/FastAPI): AI processing and analysis services
- **Extension** (TypeScript): Browser extension for meeting integration

## 📋 Prerequisites

Before installing Au5, ensure you have one of the following container runtimes installed:

### For Docker Installation:
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) or Docker Engine
- Docker Compose v2.0 or higher

### For Podman Installation:
- [Podman](https://podman.io/getting-started/installation) v4.0 or higher
- Podman Compose (optional, for Docker Compose compatibility)

## 🚀 Quick Start

### Option 1: Docker Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-org/Au5.git
   cd Au5/modules
   ```

2. **Start all services using Docker Compose:**
   ```bash
   docker-compose up -d
   ```

3. **Initialize the database:**
   ```powershell
   # On Windows
   .\init-database-v2.ps1
   
   # On Linux/macOS
   chmod +x init-database-v2.ps1
   ./init-database-v2.ps1
   ```

4. **Access the services:**
   - **Panel (Frontend)**: http://localhost:1368
   - **Backend API**: http://localhost:1366
   - **Bot Father**: http://localhost:1367
   - **SQL Server**: localhost:1433
   - **Redis**: localhost:6379

### Option 2: Podman Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-org/Au5.git
   cd Au5/modules
   ```

2. **Create the Au5 network:**
   ```bash
   podman network create au5
   ```

3. **Start all services using the Podman script:**
   ```powershell
   # On Windows
   .\start-podman.ps1
   
   # On Linux/macOS
   chmod +x start-podman.ps1
   ./start-podman.ps1
   ```

4. **Initialize the database:**
   ```powershell
   # On Windows
   .\init-database-v2.ps1
   
   # On Linux/macOS
   chmod +x init-database-v2.ps1
   ./init-database-v2.ps1
   ```

5. **Access the services:**
   - **Panel (Frontend)**: http://localhost:1368
   - **Backend API**: http://localhost:1366
   - **Bot Father**: http://localhost:1367
   - **SQL Server**: localhost:1433
   - **Redis**: localhost:6379

## 🔧 Manual Module Installation

### Backend (.NET 9)

**Docker:**
```bash
cd modules/backend
docker build -t au5-backend .
docker run -d --name au5-backend --network au5 \
  -p 1366:8080 \
  -e ASPNETCORE_ENVIRONMENT=Production \
  -e "ConnectionStrings__DefaultConnection=Server=sqlserver,1433;Database=Au5Db;User Id=Au5User;Password=Au5UserStrong!Pass123;TrustServerCertificate=true" \
  -e "ConnectionStrings__Redis=redis:6379" \
  au5-backend
```

**Podman:**
```bash
cd modules/backend
podman build -t au5-backend .
podman run -d --name au5-backend --network au5 \
  -p 1366:8080 \
  -e ASPNETCORE_ENVIRONMENT=Production \
  -e "ConnectionStrings__ApplicationDbContext=Server=localhost,1433;Database=Au5Db;User Id=Au5User;Password=Au5UserStrong!Pass123;TrustServerCertificate=true" \
  -e "ConnectionStrings__Redis=localhost:6379" \
  au5-backend
```

### Panel (Next.js Frontend)

**Docker:**
```bash
cd modules/panel
docker build -t au5-panel .
docker run -d --name au5-panel --network au5 \
  -p 1368:3000 \
  -e NODE_ENV=production \
  -e NEXT_PUBLIC_API_URL=http://localhost:1366 \
  au5-panel
```

**Podman:**
```bash
cd modules/panel
podman build -t au5-panel .
podman run -d --name au5-panel --network au5 \
  -p 1368:3000 \
  -e NODE_ENV=production \
  -e NEXT_PUBLIC_API_URL=http://localhost:1366 \
  au5-panel
```

### Bot (Meeting Transcription Bot)

**Docker:**
```bash
cd modules/bot
docker build -t au5-bot .

# Run a bot for a specific meeting
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

**Podman:**
```bash
cd modules/bot
podman build -t au5-bot .

# Run a bot for a specific meeting
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

### BotFather (Bot Management Service)

**Docker:**
```bash
cd modules/botFather
docker build -t au5-botfather .
docker run -d --name au5-botfather --network au5 \
  -p 1367:8081 \
  -v /var/run/docker.sock:/var/run/docker.sock \
  au5-botfather
```

**Podman:**
```bash
cd modules/botFather
podman build -t au5-botfather .
podman run -d --name au5-botfather --network au5 \
  -p 1367:8081 \
  -v /run/podman/podman.sock:/var/run/docker.sock \
  au5-botfather
```

### AI Engine (Python/FastAPI)

**Docker:**
```bash
cd modules/aiEngine
docker build -t au5-aiengine .
docker run -d --name au5-aiengine --network au5 \
  -p 8000:8000 \
  -e OPENAI_API_KEY=your_openai_api_key \
  au5-aiengine
```

**Podman:**
```bash
cd modules/aiEngine
podman build -t au5-aiengine .
podman run -d --name au5-aiengine --network au5 \
  -p 8000:8000 \
  -e OPENAI_API_KEY=your_openai_api_key \
  au5-aiengine
```

## 🗃️ Database Setup

The platform uses SQL Server and Redis for data storage:

### SQL Server
- **Image**: `mcr.microsoft.com/mssql/server:2022-latest`
- **Port**: 1433
- **Default Password**: `SAStrong!Pass123`
- **Database**: Au5Db

### Redis
- **Image**: `redis:7-alpine`
- **Port**: 6379
- **Configuration**: Persistence enabled with AOF

## 🛑 Stopping Services

### Docker
```bash
# Stop all services
docker-compose down

# Stop and remove volumes (WARNING: This will delete all data!)
docker-compose down -v
```

### Podman
```bash
# Stop all services
./stop-podman.ps1

# Or manually:
podman pod stop au5-pod
podman pod rm -f au5-pod  # This removes all containers
podman volume rm sqlserver_data redis_data  # This deletes all data
```

## 🔧 Configuration

### Environment Variables

Each module supports various environment variables for configuration:

#### Backend
- `ASPNETCORE_ENVIRONMENT`: Development/Production
- `ConnectionStrings__DefaultConnection`: SQL Server connection string
- `ConnectionStrings__Redis`: Redis connection string

#### Panel
- `NODE_ENV`: development/production
- `NEXT_PUBLIC_API_URL`: Backend API URL

#### Bot
- `MEETING_CONFIG`: JSON configuration for meeting parameters
- `PINO_LOG_LEVEL`: Logging level (debug, info, warn, error)

#### AI Engine
- `OPENAI_API_KEY`: OpenAI API key for AI processing

## 📚 Module Documentation

For detailed information about each module, refer to their individual README files:

- [Backend](modules/backend/README.md)
- [Panel](modules/panel/README.md)
- [Bot](modules/bot/README.md)
- [BotFather](modules/botFather/README.md)
- [AI Engine](modules/aiEngine/README.md)
- [Extension](modules/extension/README.md)

## 🤝 Contributing

Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## 📄 License

This project is licensed under the terms specified in the [LICENSE](LICENSE) file.
