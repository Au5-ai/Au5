# Au5 Panel

The Au5 Panel is a Next.js-based web application that provides a comprehensive admin panel and user interface for the Au5 meeting assistant platform. It offers meeting management, user administration, AI assistant configuration, and real-time monitoring capabilities.

## Features

- **Meeting Management**: Create, monitor, and manage meeting sessions
- **User Administration**: User management and role-based access control
- **AI Assistant Configuration**: Configure and manage AI assistants
- **Real-time Dashboard**: Live monitoring of meetings and bot activities
- **Transcription Viewer**: View and manage meeting transcriptions
- **Analytics & Reporting**: Meeting analytics and performance metrics
- **Responsive Design**: Modern, mobile-friendly interface
- **Dark/Light Mode**: Theme support for better user experience

## Prerequisites

Choose one of the following installation methods:

### For Container Deployment
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) or Docker Engine
- OR [Podman](https://podman.io/getting-started/installation) v4.0 or higher

### For Local Development
- Node.js 18 or higher
- npm, yarn, or pnpm package manager
- Au5 backend service running

## Installation & Usage

### Option 1: Using Docker

#### 1. Build the Image
Navigate to the panel module directory and build the image:

```bash
cd modules/panel
docker build -t au5-panel .
```

#### 2. Run the Container
Run the panel with backend connection:

```bash
docker run -d --name au5-panel --network au5 \
    -p 1368:3000 \
    -e NODE_ENV=production \
    -e NEXT_PUBLIC_API_URL=http://localhost:1366 \
    --restart unless-stopped \
    au5-panel
```

### Option 2: Using Podman

#### 1. Create Network (if not already created)
```bash
podman network create au5
```

#### 2. Build the Image
Navigate to the panel module directory and build the image:

```bash
cd modules/panel
podman build -t au5-panel .
```

#### 3. Run the Container
Run the panel with backend connection:

```bash
podman run -d --name au5-panel --network au5 \
    -p 1368:3000 \
    -e NODE_ENV=production \
    -e NEXT_PUBLIC_API_URL=http://localhost:1366 \
    --restart unless-stopped \
    au5-panel
```

### Option 3: Local Development

#### 1. Install Dependencies
Navigate to the panel module directory and install dependencies:

```bash
cd modules/panel
npm install
# or
yarn install
# or
pnpm install
```

#### 2. Configure Environment Variables
Create a `.env.local` file in the panel directory:

```env
NEXT_PUBLIC_API_URL=http://localhost:1366
NEXT_PUBLIC_WS_URL=ws://localhost:1366/meetinghub
NODE_ENV=development
```

#### 3. Run the Development Server
```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

The application will be available at http://localhost:3000

#### 4. Build for Production
```bash
npm run build
npm start
# or
yarn build
yarn start
# or
pnpm build
pnpm start
```

## Configuration

The panel supports various configuration options through environment variables:

### Environment Variables

#### Required
- `NEXT_PUBLIC_API_URL`: URL of the Au5 backend API (e.g., `http://localhost:1366`)

#### Optional
- `NEXT_PUBLIC_WS_URL`: WebSocket URL for real-time updates
- `NODE_ENV`: Environment mode (development/production)
- `NEXT_PUBLIC_APP_NAME`: Application name for branding
- `NEXT_PUBLIC_APP_VERSION`: Application version
- `NEXTAUTH_URL`: NextAuth.js URL (if using authentication)
- `NEXTAUTH_SECRET`: NextAuth.js secret key

### Example Configuration
```bash
# For Docker/Podman
docker run -d --name au5-panel --network au5 \
    -p 1368:3000 \
    -e NODE_ENV=production \
    -e NEXT_PUBLIC_API_URL=http://au5-backend:1366 \
    -e NEXT_PUBLIC_WS_URL=ws://au5-backend:1366/meetinghub \
    -e NEXT_PUBLIC_APP_NAME="Au5 Meeting Assistant" \
    au5-panel
```

## Features Overview

### Meeting Management
- **Meeting Dashboard**: Overview of all active and past meetings
- **Meeting Creation**: Create new meetings with custom settings
- **Bot Management**: Deploy and monitor meeting bots
- **Real-time Monitoring**: Live updates of meeting status and participants

### User Administration
- **User Management**: Add, edit, and manage user accounts
- **Role Management**: Configure user roles and permissions
- **Authentication**: Secure login and session management
- **Profile Management**: User profile and preferences

### AI Assistant Features
- **Assistant Configuration**: Set up and configure AI assistants
- **Model Selection**: Choose from different AI models and parameters
- **Custom Prompts**: Create and manage custom AI prompts
- **Performance Metrics**: Monitor AI assistant performance

### Transcription Management
- **Live Transcriptions**: View real-time meeting transcriptions
- **Transcription History**: Browse and search past transcriptions
- **Export Options**: Export transcriptions in various formats
- **Language Support**: Multi-language transcription support

### Analytics & Reporting
- **Meeting Analytics**: Detailed meeting statistics and insights
- **Usage Reports**: Platform usage and performance reports
- **User Activity**: Track user engagement and activity
- **Export Data**: Export analytics data for external analysis

## Architecture

The panel is built with modern web technologies:

### Tech Stack
- **Next.js 14**: React framework with App Router
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first CSS framework
- **Shadcn/ui**: Modern React component library
- **React Query**: Data fetching and state management
- **Socket.io**: Real-time communication
- **NextAuth.js**: Authentication (if enabled)

### Project Structure
```
app/
├── (authenticated)/      # Protected routes
│   ├── assistants/      # AI assistant management
│   ├── meeting/         # Meeting management
│   ├── playground/      # AI playground
│   ├── system/          # System settings
│   └── users/           # User management
├── (pages)/             # Public pages
│   ├── login/           # Login page
│   ├── setup/           # Initial setup
│   └── exConfig/        # External configuration
└── globals.css          # Global styles

shared/
├── components/          # Reusable components
├── hooks/              # Custom React hooks
├── lib/                # Utility functions
├── network/            # API client
├── providers/          # Context providers
└── types/              # TypeScript types
```

## API Integration

The panel communicates with the Au5 backend through REST APIs and WebSocket connections:

### REST API Endpoints
- **Authentication**: `/api/auth/*`
- **Meetings**: `/api/meetings/*`
- **Users**: `/api/users/*`
- **Assistants**: `/api/assistants/*`
- **Transcriptions**: `/api/transcriptions/*`

### Real-time Features
- **Meeting Updates**: Live meeting status updates
- **Transcription Stream**: Real-time transcription data
- **Notifications**: System notifications and alerts
- **Bot Status**: Live bot monitoring

### Example API Usage
```typescript
// Fetch meetings
const meetings = await apiClient.meetings.getAll();

// Create a new meeting
const newMeeting = await apiClient.meetings.create({
  title: "Team Standup",
  platform: "googleMeet",
  settings: { transcription: true }
});

// Real-time connection
const socket = io(process.env.NEXT_PUBLIC_WS_URL);
socket.on('meetingUpdate', handleMeetingUpdate);
```

## Container Management

### Managing the Panel Container

**Docker:**
```bash
# View container status
docker ps --filter "name=au5-panel"

# View logs
docker logs au5-panel -f

# Stop the container
docker stop au5-panel

# Restart the container
docker restart au5-panel

# Remove the container
docker rm au5-panel
```

**Podman:**
```bash
# View container status
podman ps --filter "name=au5-panel"

# View logs
podman logs au5-panel -f

# Stop the container
podman stop au5-panel

# Restart the container
podman restart au5-panel

# Remove the container
podman rm au5-panel
```

## Development

### Development Commands
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linting
npm run lint

# Run type checking
npm run type-check

# Generate component
npm run generate:component
```

### Code Quality
The project includes several code quality tools:
- **ESLint**: Code linting and style enforcement
- **Prettier**: Code formatting
- **TypeScript**: Type checking
- **Husky**: Git hooks for quality checks

### Testing
```bash
# Run unit tests (if available)
npm test

# Run e2e tests (if available)
npm run test:e2e

# Run component tests
npm run test:components
```

## Deployment

### Production Build
```bash
# Build the application
npm run build

# The build output will be in the .next folder
# For standalone deployment, ensure output: 'standalone' in next.config.js
```

### Environment-specific Builds
```bash
# Development build
NODE_ENV=development npm run build

# Production build
NODE_ENV=production npm run build
```

## Troubleshooting

### Common Issues

1. **Backend Connection Issues**:
   - Verify the `NEXT_PUBLIC_API_URL` is correct
   - Check if the Au5 backend is running and accessible
   - Review CORS settings on the backend

2. **Build Issues**:
   - Clear `.next` folder and node_modules, then reinstall
   - Check for TypeScript errors: `npm run type-check`
   - Verify all environment variables are set correctly

3. **Real-time Features Not Working**:
   - Check WebSocket URL configuration
   - Verify the backend WebSocket endpoint is accessible
   - Review browser console for connection errors

4. **Authentication Issues**:
   - Verify authentication configuration
   - Check if NextAuth.js is properly configured (if used)
   - Review authentication tokens and session management

### Debug Mode
Enable debug mode for detailed logging:
```bash
# Set debug environment variable
DEBUG=au5:* npm run dev

# Or in the browser console
localStorage.setItem('debug', 'au5:*');
```

### Log Analysis
```bash
# View real-time container logs
docker logs au5-panel -f

# Search for errors
docker logs au5-panel 2>&1 | grep -i error

# Export logs to file
docker logs au5-panel > panel-logs.txt 2>&1
```

## Performance Optimization

The panel includes several performance optimizations:

- **Next.js Optimizations**: Built-in performance features
- **Code Splitting**: Automatic code splitting for faster loading
- **Image Optimization**: Next.js Image component for optimized images
- **Caching**: Aggressive caching strategies for better performance
- **Bundle Analysis**: Bundle analyzer for optimization insights

### Performance Monitoring
```bash
# Analyze bundle size
npm run analyze

# Performance audit
npm run lighthouse
```

## Security

Security measures implemented in the panel:

- **Content Security Policy**: Strict CSP headers
- **Authentication**: Secure user authentication
- **CSRF Protection**: Cross-site request forgery protection
- **Input Validation**: Client and server-side validation
- **Secure Headers**: Security headers for production deployment

## Customization

### Theming
The panel supports custom theming through:
- **CSS Variables**: Customizable color schemes
- **Tailwind Configuration**: Extend or modify the design system
- **Component Overrides**: Custom component styling

### Branding
Customize the application branding:
- **Logo**: Replace logo files in the public folder
- **Colors**: Update theme colors in the configuration
- **Typography**: Customize fonts and text styles
- **Layout**: Modify layout components for custom layouts
