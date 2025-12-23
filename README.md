# Au5 - AI-Powered Meeting Assistant Platform

> [!WARNING]
> This software has not received external security review and may contain vulnerabilities and may not necessarily meet its stated security goals. Do not use it for sensitive use cases, and do not rely on its security until it has been reviewed. Work in progress.

Au5 is a comprehensive AI-powered meeting assistant platform that provides real-time transcription, AI analysis, and meeting management capabilities. The platform consists of multiple microservices that work together to deliver a seamless meeting experience.

## 🏗️ Architecture Overview

The Au5 platform consists of the following modules:

- **Backend** (.NET 9): Core API and business logic with SignalR hubs
- **Panel** (Next.js): Web-based admin panel and user interface

## 📋 Prerequisites

Before installing Au5, ensure you have one of the following container runtimes installed:

### For Podman Installation:

- [Podman](https://podman.io/getting-started/installation) v4.0 or higher
- Podman Compose (optional, for Docker Compose compatibility)

## 🚀 Quick Start

### Option 2: Podman Installation

1. **Start all services using the Podman script:**

   ```powershell
   # On Windows
   .\start-podman.ps1

   # On Linux/macOS
   chmod +x start-podman.ps1
   ./start-podman.ps1
   ```

2. **Access the services:**
   - **Panel (Frontend)**: http://localhost:1368
   - **Backend API**: http://localhost:1366
   - **SQL Server**: localhost:1433
   - **Redis**: localhost:6379

## Add Fake Data (Only for Development)

- Go to Panel (front-end) /setup and add Admin
- Run https://github.com/Au5-ai/Au5/blob/main/modules/backend/src/Au5.Infrastructure/Persistence/Scripts/FakeData-ForTesting.sql script to add some record for your user.

## 🤝 Contributing

Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## 📄 License

This project is licensed under the terms specified in the [LICENSE](LICENSE) file.
