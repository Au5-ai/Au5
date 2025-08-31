# Development Guide - Au5 React Chrome Extension

## Quick Start

1. **Install dependencies:**

   ```bash
   npm install
   ```

2. **Development mode:**

   ```bash
   npm run dev
   ```

3. **Build for production:**
   ```bash
   npm run build:extension
   ```

## Project Structure

```
r-extension/
├── src/
│   ├── background.ts         # Service worker
│   ├── content.ts           # Content script
│   ├── content.css          # Content script styles
│   ├── popup/
│   │   ├── popup.html       # Popup HTML
│   │   ├── popup.tsx        # Popup entry point
│   │   ├── PopupApp.tsx     # Main popup component
│   │   └── popup.css        # Popup styles
│   ├── components/
│   │   └── Button.tsx       # Reusable components
│   └── utils/
│       └── chrome.ts        # Chrome API utilities
├── public/
│   └── icons/               # Extension icons
├── dist/                    # Built extension (after build)
├── manifest.json            # Extension manifest
├── package.json
├── tsconfig.json
├── vite.config.ts
└── build.ps1               # Build script
```

## Development Workflow

### 1. Setting up for Development

```bash
# Navigate to the extension directory
cd modules/r-extension

# Install dependencies
npm install
```

### 2. Development Mode

```bash
# Start development server
npm run dev
```

This will:

- Start Vite dev server with hot reload
- Watch for file changes
- Provide fast refresh for React components

### 3. Building the Extension

```bash
# Build the complete extension
npm run build:extension
```

This will:

- Compile TypeScript
- Bundle React components
- Copy manifest and assets
- Create the `dist/` directory ready for Chrome

### 4. Loading in Chrome

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode" (toggle in top right)
3. Click "Load unpacked"
4. Select the `dist/` folder from this project
5. The extension should now appear in your extensions list

### 5. Testing Changes

During development:

1. Make changes to your code
2. Run `npm run build:extension`
3. Go to Chrome extensions page
4. Click the refresh button on your extension
5. Test the changes

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build TypeScript and bundle with Vite
- `npm run build:extension` - Complete extension build with assets
- `npm run clean` - Clean build directory
- `npm run watch` - Build in watch mode
- `npm run preview` - Preview production build

## Key Features

### Background Script (`src/background.ts`)

- Handles extension lifecycle
- Manages storage and settings
- Processes messages between components

### Content Script (`src/content.ts`)

- Injected into web pages
- Handles page interaction
- UI injection capabilities

### Popup (`src/popup/`)

- React-based user interface
- Extension controls and settings
- Tab information display

### Chrome APIs

- Storage API for settings persistence
- Tabs API for page interaction
- Runtime API for messaging
- ActiveTab permission for current page access

## Customization

### Adding New Components

1. Create components in `src/components/`
2. Export from component files
3. Import and use in popup or content scripts

### Adding New Chrome Permissions

1. Update `manifest.json` permissions array
2. Update host_permissions if needed
3. Rebuild the extension

### Styling

- Popup styles: `src/popup/popup.css`
- Content script styles: `src/content.css`
- Use CSS modules or styled-components as needed

### Adding New Background Tasks

1. Add handlers in `src/background.ts`
2. Use chrome.runtime.onMessage for communication
3. Update message types in utils if needed

## Troubleshooting

### Build Issues

- Ensure all dependencies are installed: `npm install`
- Clear node_modules and reinstall if needed
- Check TypeScript errors with `npm run build`

### Extension Loading Issues

- Verify manifest.json is valid
- Check all required files are in dist/
- Look at Chrome extension errors in developer mode

### Runtime Issues

- Check browser console for errors
- Use Chrome extension developer tools
- Check background script console in extension management

## Deployment

### Chrome Web Store

1. Run `npm run build:extension`
2. Zip the `dist/` directory
3. Upload to Chrome Web Store Developer Dashboard
4. Follow Chrome Web Store guidelines

### Distribution

- The `dist/` folder contains the complete extension
- Can be loaded directly in Chrome developer mode
- Can be packaged as .crx for internal distribution

## Next Steps

1. **Add proper icons** - Replace placeholder icons in `public/icons/`
2. **Implement features** - Add your specific Au5 functionality
3. **Testing** - Add unit tests and integration tests
4. **Documentation** - Update this guide with your specific features
5. **CI/CD** - Set up automated building and testing
