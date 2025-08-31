# Au5 React Chrome Extension

A modern Chrome extension built with React, TypeScript, and Vite.

## Features

- 🚀 Built with React 18 and TypeScript
- ⚡ Fast development with Vite
- 🎨 Modern UI with CSS styling
- 🛠 Chrome Extension Manifest V3
- 📦 Production-ready build process
- 🔧 ESLint configuration for code quality

## Project Structure

```
src/
├── background.ts          # Service worker (background script)
├── content.ts            # Content script for web pages
├── content.css           # Styles for content script
├── popup/                # Popup UI
│   ├── popup.html        # Popup HTML
│   ├── popup.tsx         # Popup React entry point
│   ├── PopupApp.tsx      # Main popup component
│   └── popup.css         # Popup styles
├── components/           # Reusable React components
│   └── Button.tsx        # Button component
└── utils/                # Utility functions
    └── chrome.ts         # Chrome API utilities
```

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Install dependencies:

   ```bash
   npm install
   ```

2. Start development server:

   ```bash
   npm run dev
   ```

3. Build for production:
   ```bash
   npm run build
   ```

### Loading the Extension

1. Build the extension:

   ```bash
   npm run build
   ```

2. Open Chrome and go to `chrome://extensions/`

3. Enable "Developer mode"

4. Click "Load unpacked" and select the `dist` folder

## Development

### Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint errors
- `npm run type-check` - Run TypeScript type checking
- `npm run clean` - Clean build directory
- `npm run watch` - Build in watch mode

### Development Workflow

1. Make changes to your code
2. The extension will automatically reload in development mode
3. Test your changes in Chrome
4. Build for production when ready

## Extension Components

### Background Script (`src/background.ts`)

- Handles extension lifecycle events
- Manages storage and settings
- Processes messages from content scripts and popup

### Content Script (`src/content.ts`)

- Injected into web pages
- Handles page interaction
- Communicates with background script

### Popup (`src/popup/`)

- React-based popup UI
- Shows extension status and controls
- Provides user interface for extension features

## Chrome APIs Used

- `chrome.runtime` - Extension messaging and lifecycle
- `chrome.storage` - Data persistence
- `chrome.tabs` - Tab management and communication
- `chrome.activeTab` - Access to current tab

## Configuration

### Manifest (`manifest.json`)

The extension uses Manifest V3 with the following permissions:

- `activeTab` - Access current tab
- `storage` - Store extension data
- `tabs` - Tab management

### TypeScript Configuration

- Strict TypeScript checking enabled
- Chrome types included
- Path aliases configured (`@/` for `src/`)

## Building for Production

1. Run the build command:

   ```bash
   npm run build
   ```

2. The extension will be built to the `dist/` directory

3. You can then package the `dist/` directory as a ZIP file for Chrome Web Store submission

## Contributing

1. Follow the existing code style
2. Run `npm run lint` before committing
3. Ensure TypeScript compiles without errors
4. Test the extension thoroughly

## License

This project is part of the Au5 ecosystem.
