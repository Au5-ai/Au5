# Au5 Chrome Extension

Au5 is an open-source project that consists of three main components:

1. **Chrome Extension**: A browser extension designed to enhance productivity during online meetings by capturing transcripts and chat messages. (this repository)
2. **UI Panel**: A frontend interface for managing and visualizing meeting data.
3. **.NET 9 Backend**: A backend service for processing and storing meeting data.

---

## About the Chrome Extension

The Au5 Chrome Extension is a tool designed to improve the online meeting experience by:

- Capturing live transcripts and chat messages during meetings.
- Automatically saving meeting data for later review.
- Supporting platforms like Google Meet.

---

## How to Install

### Prerequisites

Before installing the extension, ensure you have the following:

- **Node.js** (v18 or later)
- **Chrome Browser** (latest version)

### Installation Steps

1. Clone the repository:

   ```bash
   git clone https://github.com/your-repo/Au5.git
   cd Au5
   ```

2. Install dependencies for the Chrome Extension:

   ```bash
   cd src/extension
   npm install
   ```

3. Build the extension:
   ```bash
   npm run build
   ```

---

## How to Add as a Chrome Extension

1. Open Chrome and navigate to `chrome://extensions/`.
2. Enable **Developer mode** (toggle in the top-right corner).
3. Click **Load unpacked**.
4. Select the `src/extension/dist` directory (after building the extension).
5. The extension will now appear in your Chrome extensions list.

---

## Project Structure

```
/
├── src/          # Source code for the extension
│   │── content.ts   # Content script for meeting interactions
│   │── background.ts # Background script for handling events
│   │── services/    # Service classes (e.g., storage, browser)
│   │── utils/       # Utility functions (e.g., DOM manipulation, logging)
│   │── types/       # TypeScript type definitions
│   │   └── constants.ts # Configuration and constants
│── dist/            # Compiled extension files
└── .github/                 # GitHub-specific files
```

---

## Getting Started

### Prerequisites

- **Node.js** (v18 or later)
- **.NET 9 SDK**
- **Chrome Browser** (latest version)

### Development Setup

1. Clone the repository:

   ```bash
   git clone https://github.com/your-repo/Au5.git
   cd Au5
   ```

2. Install dependencies:

   - **UI Panel**:
     ```bash
     cd src/ui
     npm install
     ```
   - **Backend**:
     ```bash
     cd src/backend
     dotnet restore
     ```

3. Run the development servers:

   - **UI Panel**:
     ```bash
     cd src/ui
     npm run dev
     ```
   - **Backend**:
     ```bash
     cd src/backend
     dotnet run --project src/Au5.API
     ```

4. Load the Chrome extension:
   - Open Chrome and navigate to `chrome://extensions/`.
   - Enable "Developer mode".
   - Click "Load unpacked" and select the `src/extension/dist` directory.

---

## Contributing

We welcome contributions! Please read our [Contributing Guidelines](CONTRIBUTING.md) before submitting pull requests.

---

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
