# AI Engine Microservice

This is the AI Engine microservice for the Au5 project. It provides AI-based APIs using FastAPI and LangChain for processing meeting transcriptions, generating summaries, and providing AI-powered insights.

## Features

- AI-powered text processing and analysis
- Meeting transcription summarization
- RESTful API with FastAPI
- OpenAI integration for advanced AI capabilities
- Swagger/OpenAPI documentation
- Configurable AI models and parameters

## Prerequisites

Choose one of the following installation methods:

### For Container Deployment
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) or Docker Engine
- OR [Podman](https://podman.io/getting-started/installation) v4.0 or higher

### For Local Development
- Python 3.9 or higher
- pip (Python package manager)

## Installation & Usage

### Option 1: Using Docker

#### 1. Build the Image
Navigate to the AI Engine module directory and build the image:

```bash
cd modules/aiEngine
docker build -t au5-aiengine .
```

#### 2. Run the Container
Run the AI Engine with your OpenAI API key:

```bash
docker run -d --name au5-aiengine --network au5 \
    -p 8000:8000 \
    -e OPENAI_API_KEY=your_openai_api_key_here \
    -e OPENAI_BASE_URL=https://api.openai.com/v1 \
    au5-aiengine
```

### Option 2: Using Podman

#### 1. Create Network (if not already created)
```bash
podman network create au5
```

#### 2. Build the Image
Navigate to the AI Engine module directory and build the image:

```bash
cd modules/aiEngine
podman build -t au5-aiengine .
```

#### 3. Run the Container
Run the AI Engine with your OpenAI API key:

```bash
podman run -d --name au5-aiengine --network au5 \
    -p 8000:8000 \
    -e OPENAI_API_KEY=your_openai_api_key_here \
    -e OPENAI_BASE_URL=https://api.openai.com/v1 \
    au5-aiengine
```

### Option 3: Local Development

#### 1. Create a Virtual Environment
```bash
cd modules/aiEngine
python -m venv venv
```

#### 2. Activate the Virtual Environment
**On Windows:**
```bash
.\venv\Scripts\activate
```

**On macOS/Linux:**
```bash
source venv/bin/activate
```

#### 3. Install Dependencies
```bash
pip install -r requirements.txt
```

#### 4. Set Up Environment Variables
Create a `.env` file in the aiEngine directory:
```bash
cp .env.example .env
```

Edit the `.env` file and add your configuration:
```env
OPENAI_API_KEY=your_openai_api_key_here
OPENAI_BASE_URL=https://api.openai.com/v1
# Add other configuration variables as needed
```

#### 5. Run the Application
```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

## Configuration

The AI Engine supports various environment variables for configuration:

### Required Environment Variables
- `OPENAI_API_KEY`: Your OpenAI API key for AI processing

### Optional Environment Variables
- `OPENAI_BASE_URL`: OpenAI API base URL (default: `https://api.openai.com/v1`)
- `AI_MODEL`: AI model to use (default: `gpt-3.5-turbo`)
- `MAX_TOKENS`: Maximum tokens for AI responses (default: `1000`)
- `TEMPERATURE`: AI response temperature (default: `0.7`)

### Example Environment Configuration
```bash
# For Docker/Podman
docker run -d --name au5-aiengine --network au5 \
    -p 8000:8000 \
    -e OPENAI_API_KEY=sk-your-key-here \
    -e OPENAI_BASE_URL=https://api.openai.com/v1 \
    -e AI_MODEL=gpt-4 \
    -e MAX_TOKENS=2000 \
    -e TEMPERATURE=0.5 \
    au5-aiengine
```

## API Documentation

The AI Engine microservice includes comprehensive API documentation:

- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc
- **OpenAPI JSON**: http://localhost:8000/openapi.json

The documentation provides an interactive interface to explore and test all available endpoints.

## API Endpoints

The AI Engine provides several endpoints for processing meeting data:

- `POST /api/v1/transcription/summarize`: Summarize meeting transcriptions
- `POST /api/v1/transcription/analyze`: Analyze transcription content
- `POST /api/v1/chat/completion`: General AI chat completion
- `GET /health`: Health check endpoint

## Container Management

### Managing the AI Engine Container

**Docker:**
```bash
# View container status
docker ps --filter "name=au5-aiengine"

# View logs
docker logs au5-aiengine -f

# Stop the container
docker stop au5-aiengine

# Restart the container
docker restart au5-aiengine

# Remove the container
docker rm au5-aiengine
```

**Podman:**
```bash
# View container status
podman ps --filter "name=au5-aiengine"

# View logs
podman logs au5-aiengine -f

# Stop the container
podman stop au5-aiengine

# Restart the container
podman restart au5-aiengine

# Remove the container
podman rm au5-aiengine
```

## Troubleshooting

### Common Issues

1. **OpenAI API Key Issues**:
   - Verify your API key is valid and has sufficient credits
   - Check that the `OPENAI_API_KEY` environment variable is set correctly
   - Ensure the API key has the necessary permissions

2. **Connection Issues**:
   - Verify the container is running on the correct port (8000)
   - Check that the container is on the `au5` network
   - Ensure firewall settings allow traffic on port 8000

3. **Performance Issues**:
   - Monitor API rate limits with OpenAI
   - Adjust `MAX_TOKENS` and `TEMPERATURE` for optimal performance
   - Consider using a more powerful AI model for complex tasks

### Log Analysis
```bash
# View real-time logs
docker logs au5-aiengine -f

# Search for errors
docker logs au5-aiengine 2>&1 | grep -i error

# Export logs to file
docker logs au5-aiengine > aiengine-logs.txt 2>&1
```

## Development

For local development and testing:

1. Install development dependencies:
   ```bash
   pip install -r requirements-dev.txt  # if available
   ```

2. Run tests:
   ```bash
   pytest  # if tests are available
   ```

3. Format code:
   ```bash
   black app/  # if black is configured
   ```

4. Run with hot reload:
   ```bash
   uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
   ```