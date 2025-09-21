# Copilot AI Agent Instructions for Au5

## Panel (UI) Module

- This is a Next.js (App Router) project for the Au5 Panel UI, supporting user onboarding, authentication, and configuration workflows.
- The codebase is modular, with key logic in `views/(pages)/exConfig/steps/`, shared UI in `shared/components/`, and API/network logic in `shared/network/`.
- State management and async flows use React hooks and TanStack React Query.

## Key Architectural Patterns

- **Global captions:** All user-facing text comes from `shared/i18n/captions` for localization.
- **UI components:** Use only components from `shared/components/ui/` for forms, buttons, etc. Do not use raw HTML elements for UI.

## Developer Workflows

- **Start dev server:** `npm run dev` (from `modules/panel`)
- **Lint:** `npm run lint`
- **Build:** `npm run build`
- **Test:** (No test script found; add if needed)
- **Environment:** Use `.env.local` for secrets/config.

## Project Conventions

- **File naming:** Use kebab-case for files, PascalCase for components.
- **Component props:** Always type props explicitly.
- **Error handling:** Show errors using `toast` from `sonner`.
- **Form validation:** Use local state and validation helpers from `shared/lib/utils`.
- **API requests:** Use `apiRequestClient` and URLs from `shared/network/api/urls`.

## Integration Points

- **Backend:** All API calls go through the backend defined in `shared/network/api/urls`.
- **i18n:** All captions and validation messages are centralized.

## References

- Main entry: `app/page.tsx`
- Onboarding: `views/(pages)/exConfig`
- Shared UI: `shared/components/ui/`
- API: `shared/network/`
- Auth: `shared/hooks/use-auth.ts`

## BackEnd Module

**Overview:**

- Language: C# (.NET)
- Solution: `Au5.BackEnd.sln`
- Main API: `src/Au5.BackEnd/Au5.BackEnd.csproj`
- Domain: `src/Au5.Domain/Au5.Domain.csproj`
- Host: `src/Au5.AppHost/Au5.AppHost.csproj`
- Library: `src/Au5.ServiceDefaults/Au5.ServiceDefaults.csproj`
- Application: `src/Au5.Application/Au5.Application.csproj`
- Infrastructure: `src/Au5.Infrastructure/Au5.Infrastructure.csproj`
- Shared: `src/Au5.Shared/Au5.Shared.csproj`
- Unit Tests: `tests/Au5.UnitTests/Au5.UnitTests.csproj`
- Integration Tests: `tests/Au5.IntegrationTests/Au5.IntegrationTests.csproj`

**Guidelines:**

- Follow SOLID principles and clean architecture.
- Write unit and integration tests for new features.
- Don't write comments in code.
- Reuse shared code from the Au5.Shared project when possible.

**Unit Test Rules:**

- Don't write comments in Unit Tests.
- Name test methods using the pattern: `Should_<ExpectedResult>_When_<Condition>` (e.g., `Should_ReturnToken_When_ValidUser`).
- Use pure xUnit assertions (`Assert.Equal`, `Assert.True`, etc.), avoid other assertion libraries.
- Mock `DbSet<T>` using MockQueryable.Moq for LINQ support.
- Use Moq's `Mock<>` for all dependencies and services.
