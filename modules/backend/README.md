# Au5 Backend

The Au5 Backend is a .NET 9 web API that serves as the core backend service for the Au5 meeting assistant platform. It provides RESTful APIs, SignalR hubs for real-time communication, and handles all business logic for meeting management, user authentication, and data persistence.

## Features

-   RESTful API endpoints for meeting management
-   SignalR hubs for real-time communication
-   User authentication and authorization
-   Meeting transcription processing
-   Assistant management
-   SQL Server database integration
-   Redis caching support
-   Comprehensive logging and monitoring

## Prerequisites

Choose one of the following installation methods:

### For Container Deployment

-   [Docker Desktop](https://www.docker.com/products/docker-desktop/) or Docker Engine
-   OR [Podman](https://podman.io/getting-started/installation) v4.0 or higher

### For Local Development

-   .NET 9 SDK
-   SQL Server (local or containerized)
-   Redis (local or containerized)

## Installation & Usage

### Option 1: Using Docker

#### 1. Build the Image

Navigate to the backend module directory and build the image:

```bash
cd modules/backend
docker build -t au5-backend .
```

#### 2. Run the Container

Run the backend with required dependencies:

```bash
# Make sure SQL Server and Redis are running first
docker run -d --name au5-backend --network au5 \
    -p 1366:8080 \
    -e ASPNETCORE_ENVIRONMENT=Production \
    -e "ConnectionStrings__DefaultConnection=Server=sqlserver,1433;Database=Au5Db;User Id=Au5User;Password=Au5UserStrong!Pass123;TrustServerCertificate=true" \
    -e "ConnectionStrings__Redis=redis:6379" \
    au5-backend
```

### Option 2: Using Podman

#### 1. Create Network (if not already created)

```bash
podman network create au5
```

#### 2. Build the Image

Navigate to the backend module directory and build the image:

```bash
cd modules/backend
podman build -t au5-backend .
```

#### 3. Run the Container

Run the backend with required dependencies:

```bash
# Make sure SQL Server and Redis are running first
podman run -d --name au5-backend --network au5 \
    -p 1366:8080 \
    -e ASPNETCORE_ENVIRONMENT=Production \
    -e "ConnectionStrings__ApplicationDbContext=Server=localhost,1433;Database=Au5Db;User Id=Au5User;Password=Au5UserStrong!Pass123;TrustServerCertificate=true" \
    -e "ConnectionStrings__Redis=localhost:6379" \
    au5-backend
```

### Option 3: Local Development

#### 1. Install .NET 9 SDK

Download and install the .NET 9 SDK from [Microsoft's official site](https://dotnet.microsoft.com/download/dotnet/9.0).

#### 2. Set Up Dependencies

Ensure you have SQL Server and Redis running locally or via containers.

#### 3. Configure Connection Strings

Update the connection strings in `appsettings.Development.json`:

```json
{
	"ConnectionStrings": {
		"DefaultConnection": "Server=localhost,1433;Database=Au5Db;User Id=Au5User;Password=Au5UserStrong!Pass123;TrustServerCertificate=true",
		"Redis": "localhost:6379"
	}
}
```

#### 4. Run the Application

```bash
cd modules/backend
dotnet restore
dotnet run --project src/Au5.BackEnd/Au5.BackEnd.csproj
```

## Configuration

The backend supports various configuration options through environment variables and appsettings.json files:

### Environment Variables

-   `ASPNETCORE_ENVIRONMENT`: Environment (Development/Production)
-   `ConnectionStrings__DefaultConnection`: SQL Server connection string
-   `ConnectionStrings__Redis`: Redis connection string

### Database Configuration

The backend uses Entity Framework Core with SQL Server:

-   **Database**: Au5Db
-   **Migrations**: Located in `Au5.Infrastructure/Persistence/Migrations/`
-   **Seeding**: Initial data seeding on startup

### SignalR Hubs

The backend provides real-time communication through SignalR hubs:

-   **Meeting Hub**: `/meetinghub` - Real-time meeting updates
-   **Notification Hub**: Real-time notifications

## Architecture

The backend follows Clean Architecture principles with the following layers:

-   **Au5.BackEnd**: Web API layer (Controllers, SignalR Hubs)
-   **Au5.Application**: Application layer (Use Cases, DTOs)
-   **Au5.Domain**: Domain layer (Entities, Value Objects)
-   **Au5.Infrastructure**: Infrastructure layer (Data Access, External Services)
-   **Au5.Shared**: Shared utilities and constants

## Database Management

### Running Migrations

```bash
# Add new migration
dotnet ef migrations add MigrationName --project src/Au5.Infrastructure --startup-project src/Au5.BackEnd

# Update database
dotnet ef database update --project src/Au5.Infrastructure --startup-project src/Au5.BackEnd
```

### Database Initialization

The backend includes a PowerShell script for database initialization:

```powershell
# Run from the modules directory
.\init-database-v2.ps1
```

## Development

### Running Tests

```bash
# Run unit tests
dotnet test tests/Au5.UnitTests/

# Run integration tests
dotnet test tests/Au5.IntegrationTests/
```

### Code Quality

The project includes:

-   **StyleCop**: Code style analysis
-   **EditorConfig**: Consistent code formatting
-   **Directory.Build.props**: Shared build properties

## Troubleshooting

### Common Issues

1. **Database Connection Issues**:

    - Verify SQL Server is running and accessible
    - Check connection string format and credentials
    - Ensure database exists and user has permissions

2. **Redis Connection Issues**:

    - Verify Redis is running and accessible
    - Check Redis connection string
    - Ensure Redis accepts connections from the backend

3. **Port Conflicts**:
    - Ensure port 1366 (or 8080 in container) is not in use
    - Check firewall settings
    - Verify network configuration
