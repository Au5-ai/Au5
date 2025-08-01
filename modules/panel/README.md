# Au5 Panel

A modern React application for managing Au5 meeting bots, built with TypeScript, React Query, React Router, Zustand, and shadcn/ui.

## Features

- 📊 **Dashboard**: Overview of meetings, transcriptions, and system status
- 🎥 **Meeting Management**: Create, start, and manage meeting bots
- 📝 **Transcriptions**: View and manage meeting transcriptions
- ⚙️ **Settings**: Configure application preferences and bot settings
- 🎨 **Modern UI**: Built with shadcn/ui and Tailwind CSS
- 📱 **Responsive**: Works on desktop and mobile devices

## Tech Stack

- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **React Router** - Client-side routing
- **TanStack Query** - Server state management
- **Zustand** - Client state management
- **shadcn/ui** - UI components
- **Tailwind CSS** - Styling
- **Radix UI** - Headless UI primitives

## Project Structure

```
src/
├── components/
│   ├── layout/
│   │   └── Layout.tsx          # Main layout component
│   └── ui/                     # shadcn/ui components
│       ├── button.tsx
│       ├── card.tsx
│       └── toaster.tsx
├── hooks/
│   └── useMeetings.ts          # React Query hooks
├── lib/
│   └── utils.ts                # Utility functions
├── pages/
│   ├── Dashboard.tsx           # Dashboard page
│   ├── Meetings.tsx            # Meetings management
│   ├── Settings.tsx            # Application settings
│   └── Transcriptions.tsx     # Transcriptions view
├── stores/
│   └── appStore.ts             # Zustand store
├── types/
│   └── index.ts                # TypeScript types
├── App.tsx                     # Main app component
├── main.tsx                    # App entry point
└── index.css                   # Global styles
```

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn or pnpm

### Installation

1. Install dependencies:

```bash
npm install
```

2. Start the development server:

```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser

### Environment Variables

Create a `.env` file in the root directory:

```env
VITE_API_BASE_URL=http://localhost:1380
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## API Integration

The panel connects to the Au5 Captain service (Go backend) running on port 1380. It provides:

- Meeting management endpoints
- Bot configuration and startup
- Real-time status updates

## State Management

### Zustand Store (Client State)

- UI preferences (theme, sidebar state)
- User settings (language, notifications)
- Local application state

### React Query (Server State)

- Meeting data fetching and caching
- API mutations for CRUD operations
- Background refetching and synchronization

## UI Components

The application uses shadcn/ui components built on top of Radix UI primitives:

- **Button** - Various button styles and sizes
- **Card** - Content containers with headers and footers
- **Form inputs** - Text inputs, selects, checkboxes
- **Toast** - Notification system

## Routing

React Router handles client-side navigation:

- `/` - Dashboard (overview)
- `/meetings` - Meeting management
- `/transcriptions` - Transcription viewer
- `/settings` - Application settings

## Development

### Adding New Components

1. Create component in appropriate directory
2. Export from barrel file if needed
3. Add to routing if it's a page component

### Adding New API Endpoints

1. Add API function to `hooks/useMeetings.ts`
2. Create React Query hook
3. Use in components with proper error handling

### Styling Guidelines

- Use Tailwind CSS utility classes
- Follow shadcn/ui design patterns
- Maintain consistent spacing and colors
- Ensure responsive design

## Building for Production

```bash
npm run build
```

The built files will be in the `dist/` directory, ready for deployment.

## Contributing

1. Follow the existing code style and patterns
2. Add TypeScript types for new features
3. Test components and API integrations
4. Update documentation as needed
