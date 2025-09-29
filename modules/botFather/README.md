# Au5 BotFather

BotFather is a Go-based container orchestration service that manages Au5 bot instances. It provides APIs for creating, managing, and monitoring meeting bots dynamically, handling the lifecycle of bot containers for different meeting sessions.

## Features

- Dynamic bot container creation and management
- RESTful API for bot lifecycle operations
- Container orchestration with Docker/Podman
- Meeting session management
- Bot health monitoring and status reporting
- Automatic cleanup of finished bot instances
- Lightweight and efficient Go implementation

## Prerequisites

Choose one of the following installation methods:

### For Container Deployment
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) or Docker Engine
- OR [Podman](https://podman.io/getting-started/installation) v4.0 or higher
- Access to container runtime socket

### For Local Development
- Go 1.23 or higher
- Docker or Podman installed and running

## Installation & Usage

### Option 1: Using Docker

#### 1. Build the Image
Navigate to the botFather module directory and build the image:

```bash
cd modules/botFather
docker build -t au5-botfather .
```

#### 2. Run the Container
Run BotFather with access to the Docker socket:

```bash
docker run -d --name au5-botfather --network au5 \
    -p 1367:8081 \
    -v /var/run/docker.sock:/var/run/docker.sock \
    --restart unless-stopped \
    au5-botfather
```

### Option 2: Using Podman

#### 1. Create Network (if not already created)
```bash
podman network create au5
```

#### 2. Build the Image
Navigate to the botFather module directory and build the image:

```bash
cd modules/botFather
podman build -t au5-botfather .
```

#### 3. Run the Container
Run BotFather with access to the Podman socket:

```bash
podman run -d --name au5-botfather --network au5 \
    -p 1367:8081 \
    -v /run/podman/podman.sock:/var/run/docker.sock \
    --restart unless-stopped \
    au5-botfather
```

### Option 3: Local Development

#### 1. Install Go Dependencies
```bash
cd modules/botFather
go mod download
```

#### 2. Build the Application
```bash
go build -o bot-father .
```

#### 3. Run the Application
```bash
./bot-father
```

Or run directly with Go:
```bash
go run .
```

## Configuration

BotFather can be configured through environment variables:

### Environment Variables
- `PORT`: Server port (default: `8081`)
- `DOCKER_HOST`: Docker daemon socket (default: `unix:///var/run/docker.sock`)
- `BOT_IMAGE`: Bot container image name (default: `au5-bot`)
- `NETWORK_NAME`: Container network name (default: `au5`)
- `LOG_LEVEL`: Logging level (debug, info, warn, error)

### Example Configuration
```bash
# For Docker
docker run -d --name au5-botfather --network au5 \
    -p 1367:8081 \
    -e PORT=8081 \
    -e BOT_IMAGE=au5-bot \
    -e NETWORK_NAME=au5 \
    -e LOG_LEVEL=info \
    -v /var/run/docker.sock:/var/run/docker.sock \
    au5-botfather
```

## API Endpoints

BotFather provides RESTful APIs for bot management:

### Bot Management
- `POST /api/bots` - Create a new bot instance
- `GET /api/bots` - List all bot instances
- `GET /api/bots/{id}` - Get bot details
- `DELETE /api/bots/{id}` - Stop and remove a bot
- `POST /api/bots/{id}/start` - Start a stopped bot
- `POST /api/bots/{id}/stop` - Stop a running bot

### Health and Status
- `GET /health` - Health check endpoint
- `GET /api/status` - Service status information
- `GET /api/bots/{id}/logs` - Get bot logs

### Example API Usage

#### Create a Bot
```bash
curl -X POST http://localhost:1367/api/bots \
  -H "Content-Type: application/json" \
  -d '{
    "meetingId": "meeting-abc-123",
    "meetingUrl": "https://meet.google.com/abc-def-ghi",
    "botDisplayName": "Au5 Bot",
    "platform": "googleMeet",
    "language": "en-US",
    "hubUrl": "http://au5-backend:1366/meetinghub",
    "autoLeave": {
      "waitingEnter": 30000,
      "noParticipant": 60000,
      "allParticipantsLeft": 120000
    },
    "meetingSettings": {
      "videoRecording": true,
      "audioRecording": true,
      "transcription": true,
      "transcriptionModel": "liveCaption"
    }
  }'
```

#### List Bots
```bash
curl http://localhost:1367/api/bots
```

#### Stop a Bot
```bash
curl -X DELETE http://localhost:1367/api/bots/meeting-abc-123
```

## Container Management

### Managing the BotFather Container

**Docker:**
```bash
# View container status
docker ps --filter "name=au5-botfather"

# View logs
docker logs au5-botfather -f

# Stop the container
docker stop au5-botfather

# Restart the container
docker restart au5-botfather

# Remove the container
docker rm au5-botfather
```

**Podman:**
```bash
# View container status
podman ps --filter "name=au5-botfather"

# View logs
podman logs au5-botfather -f

# Stop the container
podman stop au5-botfather

# Restart the container
podman restart au5-botfather

# Remove the container
podman rm au5-botfather
```

### Managing Bot Instances

BotFather automatically manages bot containers, but you can also interact with them directly:

```bash
# List bot containers created by BotFather
docker ps --filter "label=managed-by=au5-botfather"

# View logs of a specific bot
docker logs meeting-abc-123 -f

# BotFather will automatically clean up finished bots
```

## Architecture

BotFather is built with:
- **Go 1.23**: Modern Go with generics and improved performance
- **Gorilla Mux**: HTTP routing and middleware
- **Docker API**: Container lifecycle management
- **JSON Configuration**: Flexible bot configuration
- **Structured Logging**: Comprehensive logging and monitoring

## Development

### Building from Source
```bash
# Clone and build
cd modules/botFather
go mod tidy
go build -o bot-father .
```

### Running Tests
```bash
go test ./...
```

### Development Mode
```bash
# Run with hot reload (if air is installed)
air

# Or run directly
go run . -dev
```

## Monitoring and Logging

### Log Levels
BotFather provides structured logging with different levels:
- `debug`: Detailed debugging information
- `info`: General information about bot operations
- `warn`: Warning messages for potential issues
- `error`: Error messages for failed operations

### Monitoring Bot Health
```bash
# Check BotFather health
curl http://localhost:1367/health

# Get service status
curl http://localhost:1367/api/status

# Monitor bot instances
curl http://localhost:1367/api/bots
```

## Troubleshooting

### Common Issues

1. **Container Runtime Access Issues**:
   - Verify Docker/Podman socket is accessible
   - Check permissions on the socket file
   - Ensure the container has proper socket mounting

2. **Bot Creation Failures**:
   - Verify the bot image (`au5-bot`) is available
   - Check network configuration
   - Review BotFather logs for detailed error messages

3. **API Connection Issues**:
   - Verify BotFather is running on the correct port (1367)
   - Check network connectivity
   - Ensure firewall settings allow traffic

4. **Bot Management Issues**:
   - Check if bot containers are properly labeled
   - Verify container runtime is responding
   - Review bot configuration for errors

### Log Analysis
```bash
# View real-time logs
docker logs au5-botfather -f

# Search for errors
docker logs au5-botfather 2>&1 | grep -i error

# Export logs to file
docker logs au5-botfather > botfather-logs.txt 2>&1

# View bot-specific logs
docker logs meeting-abc-123 -f
```

### Debug Mode
Run BotFather with debug logging for troubleshooting:
```bash
docker run -d --name au5-botfather --network au5 \
    -p 1367:8081 \
    -e LOG_LEVEL=debug \
    -v /var/run/docker.sock:/var/run/docker.sock \
    au5-botfather
```

## Security

BotFather implements several security measures:
- Container runtime socket access control
- Input validation for bot configurations
- Resource limits for bot containers
- Network isolation for bot instances
- Secure API endpoints with proper error handling

## Performance

- **Lightweight**: Minimal resource usage with Go's efficiency
- **Concurrent**: Handles multiple bot operations simultaneously
- **Fast Startup**: Quick container creation and management
- **Resource Management**: Automatic cleanup of finished bot instances