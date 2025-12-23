# Copilot AI Agent Instructions for Au5

Au5 is an AI-powered meeting assistant platform with a Next.js frontend (Panel) and .NET 9 backend, using Podman/Docker for containerization.

## 🏗️ Architecture Overview

**Monorepo Structure:**

- `modules/panel/` - Next.js 15 frontend with App Router
- `modules/backend/` - .NET 9 backend with Clean Architecture
- Container orchestration via Podman (PowerShell scripts in `modules/`)

**Backend follows Clean Architecture:**

- `Au5.Domain` - Entities, enums, domain logic (no dependencies)
- `Au5.Application` - Business logic, CQRS with Mediator pattern, validators
- `Au5.Infrastructure` - Data access (EF Core), external services, auth
- `Au5.BackEnd` - API controllers, SignalR hubs, middleware
- `Au5.Shared` - Cross-cutting utilities (Result pattern, constants)

**Frontend follows Feature-Based Structure:**

- `app/` - Next.js App Router pages and layouts
- `views/` - Page-level components organized by route
- `shared/` - Reusable components, hooks, network clients, i18n

## 🔑 Key Patterns & Conventions

### Backend (.NET)

**CQRS with Mediator:**

- Commands/Queries in `Au5.Application/Features/{Domain}/{Action}/`
- Handlers implement `IRequestHandler<TRequest, TResponse>`
- Pattern: `{Action}Command.Handler.cs` or `{Action}Query.Handler.cs`
- Example: `LoginCommand.Handler.cs`, `GetUsersQuery.Handler.cs`

**Result Pattern (No Exceptions for Business Logic):**

```csharp
// Return Result<T> from handlers, not throw exceptions
return Result.Success(data);
return Error.Unauthorized("Auth.InvalidCredentials", message);
```

**Validation:**

- FluentValidation validators live alongside commands/queries
- Automatic validation via `ValidatorBehavior<,>` pipeline
- See `Au5.Application/ConfigServices.cs` for pipeline setup

**Entity Framework:**

- DbContext: `Au5.Infrastructure/Persistence/Context/ApplicationDbContext.cs`
- No cascade delete (configured globally in OnModelCreating)
- Entities marked with `[Entity]` attribute
- Seed data via `modelBuilder.SeedData()` extension

**StyleCop Rules:**

- Use tabs for indentation (see `stylecop.json`)
- No code comments (exception: copyright headers in some files)
- Using directives outside namespace

**Testing:**

- Test naming: `Should_<ExpectedResult>_When_<Condition>`
- Pure xUnit assertions only (no FluentAssertions)
- Mock EF DbSet with MockQueryable.Moq for LINQ
- All dependencies mocked with Moq

**SignalR Hub:**

- `MeetingHub` at `/meetinghub` handles real-time meeting events
- Authorized access with group-based broadcasting

### Frontend (Next.js)

**Centralized i18n:**

- ALL user-facing text in `shared/i18n/captions.ts` via `GLOBAL_CAPTIONS`
- Never hardcode UI strings - always reference captions
- Example: `GLOBAL_CAPTIONS.fields.email.label`

**UI Components:**

- Use ONLY components from `shared/components/ui/` (Radix UI + Tailwind)
- Never use raw HTML `<button>`, `<input>` - use `Button`, `Input`, etc.
- Components use `class-variance-authority` for variants

**API Communication:**

- `apiRequestClient` in `shared/network/apiRequestClient.ts` handles all requests
- URLs defined in `shared/network/api/urls.ts` (e.g., `API_URLS.AUTH.LOGIN`)
- JWT stored in localStorage as `access_token`
- Auto-redirects to `/403` on forbidden responses
- Errors shown via `toast` from `sonner`

**State Management:**

- TanStack React Query for server state
- React hooks for local state
- QueryProvider wraps app in `app/layout.tsx`

**Routing:**

- Route groups: `(authenticated)`, `(pages)` in `app/` and `views/`
- Protected routes handle auth via middleware/hooks

## 🚀 Developer Workflows

**Backend:**

```bash
cd modules/backend
dotnet restore
dotnet build
dotnet test
dotnet ef migrations add <Name> --project src/Au5.Infrastructure
dotnet ef database update --project src/Au5.Infrastructure
```

**Frontend:**

```bash
cd modules/panel
npm install
npm run dev        # Start dev server (Turbopack)
npm run lint       # ESLint
npm run build      # Production build
```

**Container Orchestration:**

```powershell
# From modules/
.\start-podman.ps1   # Start all services
.\stop-podman.ps1    # Stop all services
```

**Service Ports:**

- Panel: http://localhost:1368
- Backend API: http://localhost:1366
- SQL Server: localhost:1433
- Redis: localhost:6379

## 🔧 Integration Points

**Backend ↔ Frontend:**

- REST API with JWT authentication
- SignalR hub for real-time updates
- CORS configured in `appsettings.json` → `Cors:AllowedOrigins`

**Backend ↔ Database:**

- SQL Server via EF Core
- Connection string in `appsettings.Development.json`
- Migrations in `Au5.Infrastructure/Migrations/`

**Caching:**

- Optional Redis (controlled by `ServiceSettings:UseRedis`)
- Fallback to in-memory cache

**External Services:**

- OpenAI integration for AI features (configured via `Organization:OpenAIToken`)
- Email via MailKit (SMTP settings in Organization config)

## 📁 Key Files & Directories

**Backend:**

- [modules/backend/src/Au5.BackEnd/Program.cs](modules/backend/src/Au5.BackEnd/Program.cs) - Application entry point, middleware pipeline
- [modules/backend/src/Au5.Application/ConfigServices.cs](modules/backend/src/Au5.Application/ConfigServices.cs) - Service registration, Mediator setup
- [modules/backend/src/Au5.Domain/Entities/](modules/backend/src/Au5.Domain/Entities/) - All domain entities
- [modules/backend/src/Au5.BackEnd/Hubs/MeetingHub.cs](modules/backend/src/Au5.BackEnd/Hubs/MeetingHub.cs) - SignalR hub

**Frontend:**

- [modules/panel/shared/network/apiRequestClient.ts](modules/panel/shared/network/apiRequestClient.ts) - HTTP client
- [modules/panel/shared/i18n/captions.ts](modules/panel/shared/i18n/captions.ts) - All UI text
- [modules/panel/shared/network/api/urls.ts](modules/panel/shared/network/api/urls.ts) - API endpoint definitions
- [modules/panel/app/layout.tsx](modules/panel/app/layout.tsx) - Root layout with providers

## ⚠️ Critical Rules

1. **Backend:** No comments in code, use Result pattern, name tests with Should_When pattern
2. **Frontend:** All text from GLOBAL_CAPTIONS, use UI components from shared/components/ui
3. **Backend:** Tabs for indentation (StyleCop enforced)
4. **Frontend:** File naming: kebab-case, Component naming: PascalCase
5. **Backend:** All handlers in separate `.Handler.cs` files within feature folders
6. **Frontend:** Type all props explicitly, validate forms locally before API calls
