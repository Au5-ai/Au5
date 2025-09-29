# Au5 Browser Extension

The Au5 Browser Extension is a TypeScript-based Chrome/Edge extension that integrates with meeting platforms to provide seamless access to Au5's meeting assistant features directly from your browser. It enables real-time meeting management, transcription control, and AI-powered insights without leaving your meeting interface.

## Features

- **Meeting Platform Integration**: Works with Google Meet, Zoom, and other popular platforms
- **Real-time Communication**: WebSocket connection to Au5 backend for live updates
- **Meeting Controls**: Start/stop transcription, manage bot participation
- **AI Insights**: Access meeting summaries and AI-powered analysis
- **Side Panel Interface**: Modern, responsive UI that doesn't interfere with meetings
- **Chrome Extension API**: Full integration with browser capabilities
- **TypeScript**: Type-safe development with modern ES6+ features

## Prerequisites

### For Development
- Node.js 16 or higher
- npm or yarn package manager
- Chrome/Edge browser for testing

### For Installation
- Chrome/Chromium-based browser (Chrome, Edge, Brave, etc.)
- Au5 backend service running and accessible

## Development Setup

### 1. Install Dependencies
Navigate to the extension module directory and install dependencies:

```bash
cd modules/extension
npm install
```

### 2. Build the Extension
Build the extension for development:

```bash
# Development build with watch mode
npm run dev

# Production build
npm run build
```

### 3. Load Extension in Chrome
1. Open Chrome and go to `chrome://extensions/`
2. Enable "Developer mode" in the top right
3. Click "Load unpacked"
4. Select the `modules/extension/dist` folder
5. The extension should now appear in your extensions list

## Installation

### Option 1: Development Installation
Follow the development setup steps above to install from source.

### Option 2: Production Installation
*Note: Production installation through Chrome Web Store is not yet available*

## Configuration

The extension can be configured through its options page or by modifying the configuration files:

### Extension Configuration
- **Backend URL**: URL of the Au5 backend service (default: `http://localhost:1366`)
- **WebSocket URL**: WebSocket endpoint for real-time communication
- **API Endpoints**: Various API endpoints for different functionalities
- **Meeting Platforms**: Supported meeting platforms and their configurations

### Environment Variables
Create a `.env` file in the extension directory:

```env
VITE_API_BASE_URL=http://localhost:1366
VITE_WS_URL=ws://localhost:1366/meetinghub
VITE_EXTENSION_ID=your-extension-id
```

## Usage

### Getting Started
1. Install and activate the extension
2. Ensure the Au5 backend is running
3. Join a supported meeting platform (Google Meet, Zoom, etc.)
4. Click the Au5 extension icon or use the side panel
5. Configure meeting settings and start transcription

### Main Features

#### Meeting Management
- **Start Transcription**: Begin real-time meeting transcription
- **Bot Management**: Deploy and manage meeting bots
- **Meeting Controls**: Pause, resume, or stop meeting services

#### AI Features
- **Live Transcription**: Real-time speech-to-text conversion
- **Meeting Summaries**: AI-generated meeting summaries
- **Action Items**: Automatic extraction of action items and decisions
- **Participant Insights**: Analysis of participant engagement and contributions

#### Integration Features
- **Platform Detection**: Automatically detects supported meeting platforms
- **Context Awareness**: Adapts interface based on current meeting context
- **Notification System**: Real-time notifications for important events

## Architecture

The extension follows a modular architecture:

### Core Components
- **Background Script**: Service worker for persistent functionality
- **Content Scripts**: Inject functionality into meeting pages
- **Side Panel**: Main user interface
- **API Layer**: Communication with Au5 backend
- **State Management**: Centralized state management for extension data

### File Structure
```
src/
├── background.ts          # Service worker
├── content.ts            # Content script for meeting pages
├── ui/
│   ├── sidepanel.html    # Main UI
│   ├── sidepanel.tsx     # Side panel React components
│   └── styles/           # CSS styles
├── api/                  # API communication layer
├── core/                 # Core functionality
│   ├── platforms/        # Meeting platform integrations
│   ├── stateManager.ts   # State management
│   └── utils/            # Utility functions
└── hub/                  # WebSocket communication
```

## API Integration

The extension communicates with the Au5 backend through several APIs:

### REST APIs
- **Meeting API**: CRUD operations for meetings
- **Transcription API**: Transcription management
- **User API**: User authentication and profile management
- **Assistant API**: AI assistant interactions

### WebSocket Communication
- **Meeting Hub**: Real-time meeting updates
- **Transcription Stream**: Live transcription data
- **Bot Status**: Real-time bot status updates

### Example API Usage
```typescript
// Start a new meeting transcription
const meeting = await apiClient.meetings.create({
  meetingUrl: currentMeetingUrl,
  platform: detectedPlatform,
  settings: transcriptionSettings
});

// Connect to real-time updates
const hubConnection = new MeetingHubClient();
await hubConnection.start();
hubConnection.on('transcriptionUpdate', handleTranscriptionUpdate);
```

## Development

### Building and Testing
```bash
# Install dependencies
npm install

# Development build with watch mode
npm run dev

# Production build
npm run build

# Run linting
npm run lint

# Run type checking
npm run type-check

# Clean build artifacts
npm run clean
```

### Extension Development Tools
```bash
# Reload extension during development
# Use the extension's reload button or:
chrome://extensions/ -> Developer mode -> Reload

# Debug extension
# Right-click extension icon -> Inspect popup
# Or use Chrome DevTools on extension pages
```

### Testing
```bash
# Run unit tests (if available)
npm test

# Manual testing checklist:
# 1. Extension loads without errors
# 2. Side panel opens and displays correctly
# 3. Meeting platform detection works
# 4. Backend communication is successful
# 5. WebSocket connection is stable
```

## Manifest Configuration

The extension uses Manifest V3 with the following key permissions:

```json
{
  "manifest_version": 3,
  "permissions": [
    "activeTab",
    "storage",
    "sidePanel",
    "scripting"
  ],
  "host_permissions": [
    "https://meet.google.com/*",
    "https://*.zoom.us/*",
    "http://localhost:1366/*"
  ]
}
```

## Platform Support

### Supported Meeting Platforms
- **Google Meet**: Full integration with transcription and bot management
- **Zoom**: Basic integration with transcription support
- **Microsoft Teams**: Limited support (in development)

### Browser Support
- **Chrome**: Full support (recommended)
- **Edge**: Full support
- **Brave**: Full support
- **Other Chromium browsers**: Should work but not extensively tested

## Troubleshooting

### Common Issues

1. **Extension Not Loading**:
   - Check if the extension is enabled in `chrome://extensions/`
   - Verify the manifest.json is valid
   - Check browser console for errors

2. **Backend Connection Issues**:
   - Verify the Au5 backend is running on the correct port
   - Check CORS configuration on the backend
   - Ensure the API URL in extension settings is correct

3. **Meeting Platform Detection Issues**:
   - Verify you're on a supported meeting platform
   - Check if content scripts are properly injected
   - Review browser console for platform detection errors

4. **WebSocket Connection Problems**:
   - Check if the WebSocket URL is correct
   - Verify the backend WebSocket endpoint is accessible
   - Review network tab in DevTools for connection issues

### Debug Mode
Enable debug mode for detailed logging:

```typescript
// In extension settings or local storage
localStorage.setItem('au5-debug', 'true');
```

### Log Analysis
```bash
# View extension logs in Chrome DevTools:
# 1. Right-click extension icon -> "Inspect popup"
# 2. Go to chrome://extensions/ -> Extension details -> "Inspect views: service worker"
# 3. Check browser console on meeting pages for content script logs
```

## Security

The extension implements several security measures:

- **Content Security Policy**: Strict CSP to prevent XSS attacks
- **Permission Management**: Minimal required permissions
- **Secure Communication**: HTTPS/WSS for backend communication
- **Input Validation**: Proper validation of user inputs and API responses
- **Storage Security**: Secure storage of sensitive data

## Publishing

### Chrome Web Store
To publish the extension to the Chrome Web Store:

1. Build the production version: `npm run build`
2. Create a ZIP file of the `dist` folder
3. Upload to Chrome Web Store Developer Dashboard
4. Fill in store listing details
5. Submit for review

### Development Distribution
For internal distribution:

1. Build the extension: `npm run build`
2. Package as a ZIP file
3. Distribute to users for manual installation

## Contributing

When contributing to the extension:

1. Follow TypeScript best practices
2. Maintain compatibility with Manifest V3
3. Test on multiple browsers and meeting platforms
4. Update documentation for new features
5. Ensure proper error handling and logging