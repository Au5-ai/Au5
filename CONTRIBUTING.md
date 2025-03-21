# Contributing to Au5

Thank you for your interest in contributing to Au5! This document provides guidelines and steps for contributing to the project.

## Code of Conduct

By participating in this project, you agree to abide by our Code of Conduct.

## How to Contribute

1. Fork the repository
2. Create a new branch for your feature or bug fix
3. Make your changes
4. Submit a pull request

## Development Setup

1. Clone your fork:
   ```bash
   git clone https://github.com/YOUR_USERNAME/Au5.git
   cd Au5
   ```

2. Set up the development environment:
   - Install Node.js (v18 or later)
   - Install .NET 9 SDK
   - Install dependencies for each component:
     ```bash
     # UI Panel
     cd src/ui
     npm install

     # Backend
     cd src/backend
     dotnet restore
     ```

## Code Style Guidelines

- Follow the existing code style in each component
- Use meaningful variable and function names
- Add comments for complex logic
- Write unit tests for new features
- Update documentation as needed

## Pull Request Process

1. Update the README.md with details of changes if needed
2. Update the docs/ directory with any new documentation
3. Ensure all tests pass
4. The PR will be merged once you have the sign-off of at least one other developer

## Questions?

If you have any questions, please open an issue or contact the maintainers.

Thank you for contributing to Au5! 