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
