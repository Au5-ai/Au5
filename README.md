# Au5

Au5 is an open-source project that consists of three main components:

1. Chrome Extension
2. UI Panel
3. .NET 9 Backend

## Project Structure

```
/
├── src/
│   ├── extension/           # Chrome Extension
│   ├── ui/                  # Frontend UI Panel
│   └── backend/            # .NET 9 Backend
├── docs/                   # Project documentation
├── scripts/               # Build and utility scripts
└── .github/              # GitHub specific files
```

## Getting Started

### Prerequisites

- Node.js (v18 or later)
- .NET 9 SDK
- Chrome browser (for extension development)

### Development Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   # UI Panel
   cd src/ui
   npm install

   # Backend
   cd src/backend
   dotnet restore
   ```

3. Run the development servers:
   ```bash
   # UI Panel
   cd src/ui
   npm run dev

   # Backend
   cd src/backend
   dotnet run --project src/Au5.API
   ```

4. Load the Chrome extension:
   - Open Chrome and navigate to `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked" and select the `src/extension` directory

## Contributing

Please read our [Contributing Guidelines](CONTRIBUTING.md) before submitting pull requests.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.