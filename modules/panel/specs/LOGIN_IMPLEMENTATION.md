# Login Implementation with React Query

This login system has been successfully implemented with the following features:

## Features Implemented

✅ **React Query Integration**: Uses @tanstack/react-query for state management
✅ **Token Storage**: Automatic saving of access_token to localStorage
✅ **Error Handling**: Comprehensive error handling with user feedback
✅ **Authentication Guard**: Protects dashboard routes
✅ **Logout Functionality**: Complete logout with token cleanup
✅ **Form Validation**: Client-side form validation
✅ **Loading States**: Visual feedback during login/logout operations

## File Structure

```
modules/panel/
├── lib/
│   └── api.ts                  # API configuration and auth functions
├── hooks/
│   └── use-auth.ts            # React Query hooks for auth
├── components/
│   ├── query-provider.tsx     # React Query provider setup
│   ├── login-form.tsx         # Updated login form with functionality
│   ├── logout-button.tsx      # Logout button component
│   └── auth-guard.tsx         # Authentication protection component
├── app/
│   ├── layout.tsx             # Updated with QueryProvider
│   ├── login/
│   │   └── page.tsx           # Login page (existing)
│   └── dashboard/
│       └── page.tsx           # Protected dashboard with logout
└── .env.local                 # API configuration
```

## How It Works

### 1. Login Process

1. User enters email/password in the login form
2. Form submits to `authApi.login()` via React Query mutation
3. On successful response, access_token is saved to localStorage
4. User is redirected to /dashboard
5. Errors are displayed in the form

### 2. Token Management

- Tokens are stored in localStorage using `tokenStorage` utilities
- Basic JWT expiration validation (optional)
- Automatic token inclusion in API requests

### 3. Authentication Guard

- `AuthGuard` component checks token validity
- Redirects unauthenticated users to /login
- Protects dashboard and other sensitive routes

### 4. Logout Process

- Calls backend logout endpoint
- Clears localStorage token
- Clears React Query cache
- Redirects to login page

## API Configuration

The system expects these endpoints:

- `POST /auth/login` - Login with email/password
- `POST /auth/logout` - Logout (optional)

Configure the API base URL in `.env.local`:

```
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080
```

## Usage Examples

### Login Response Format

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "Bearer",
  "expires_in": 3600
}
```

### Using the Auth Hooks

```tsx
// In any component
import { useLogin, useLogout } from "@/hooks/use-auth";

const MyComponent = () => {
  const loginMutation = useLogin();
  const logoutMutation = useLogout();

  const handleLogin = () => {
    loginMutation.mutate({ email, password });
  };

  const handleLogout = () => {
    logoutMutation.mutate();
  };
};
```

### Protecting Routes

```tsx
// Wrap protected components
import { AuthGuard } from "@/components/auth-guard";

export default function ProtectedPage() {
  return (
    <AuthGuard>
      <YourProtectedContent />
    </AuthGuard>
  );
}
```

## Development

The development server is now running with React Query DevTools available for debugging query states.

All components are fully TypeScript typed and include proper error handling.
