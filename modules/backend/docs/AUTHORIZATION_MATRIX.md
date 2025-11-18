# Authorization Matrix

This document describes the current authorization policies and access control for all API endpoints in the Au5 backend.

## Role Definitions

| Role      | Value | Description                                                                    |
| --------- | ----- | ------------------------------------------------------------------------------ |
| **Admin** | 1     | Full system access - can manage organization, users, spaces, and all resources |
| **User**  | 2     | Limited access - can manage own resources and participate in meetings          |

## Authorization Policies

| Policy Name   | Role Requirements | Description                       |
| ------------- | ----------------- | --------------------------------- |
| `AdminOnly`   | Admin             | Only administrators can access    |
| `UserOnly`    | User              | Only regular users can access     |
| `UserOrAdmin` | Admin OR User     | Any authenticated user can access |

## Endpoint Authorization Matrix

### Organizations (`/organizations`)

| Method | Endpoint                   | Admin | User | Anonymous | Policy      |
| ------ | -------------------------- | ----- | ---- | --------- | ----------- |
| POST   | `/organizations`           | ✅    | ❌   | ❌        | AdminOnly   |
| GET    | `/organizations`           | ✅    | ❌   | ❌        | AdminOnly   |
| GET    | `/organizations/extension` | ✅    | ✅   | ❌        | UserOrAdmin |

**Controller-Level Policy:** `AdminOnly`

---

### Users (`/users`)

| Method | Endpoint                             | Admin | User | Anonymous | Policy         |
| ------ | ------------------------------------ | ----- | ---- | --------- | -------------- |
| GET    | `/users`                             | ✅    | ❌   | ❌        | AdminOnly      |
| GET    | `/users/me`                          | ✅    | ✅   | ❌        | UserOrAdmin    |
| GET    | `/users/me/menus`                    | ✅    | ✅   | ❌        | UserOrAdmin    |
| GET    | `/users/me/meetings`                 | ✅    | ✅   | ❌        | UserOrAdmin    |
| GET    | `/users/spaces`                      | ✅    | ✅   | ❌        | UserOrAdmin    |
| GET    | `/users/search`                      | ✅    | ❌   | ❌        | AdminOnly      |
| POST   | `/users/invitations`                 | ✅    | ❌   | ❌        | AdminOnly      |
| POST   | `/users/invitations/{userId}/resend` | ✅    | ✅   | ✅        | AllowAnonymous |
| GET    | `/users/{userId}/verify`             | ✅    | ✅   | ✅        | AllowAnonymous |
| POST   | `/users/{userId}/verify`             | ✅    | ✅   | ✅        | AllowAnonymous |

**Controller-Level Policy:** `UserOrAdmin`

**Business Rules:**

-   **List Users:** Only admins can see all users in the organization
-   **Search Users:** Only admins can search for users
-   **Invite Users:** Only admins can send user invitations
-   **User Verification:** Public endpoints for onboarding new users

---

### Spaces (`/spaces`)

| Method | Endpoint                                 | Admin | User | Anonymous | Policy      |
| ------ | ---------------------------------------- | ----- | ---- | --------- | ----------- |
| GET    | `/spaces`                                | ✅    | ❌   | ❌        | AdminOnly   |
| POST   | `/spaces`                                | ✅    | ❌   | ❌        | AdminOnly   |
| GET    | `/spaces/{spaceId}/meetings`             | ✅    | ✅   | ❌        | UserOrAdmin |
| GET    | `/spaces/{spaceId}/members`              | ✅    | ✅   | ❌        | UserOrAdmin |
| POST   | `/spaces/{spaceId}/meetings`             | ✅    | ✅   | ❌        | UserOrAdmin |
| DELETE | `/spaces/{spaceId}/meetings/{meetingId}` | ✅    | ✅   | ❌        | UserOrAdmin |

**Controller-Level Policy:** `UserOrAdmin`

**Business Rules:**

-   **List All Spaces:** Only admins can see all spaces
-   **Create Space:** Only admins can create new spaces
-   **Space Members & Meetings:** All authenticated users can view if they have access
-   **Add/Remove Meetings:** All authenticated users can manage meetings in their spaces

---

### Assistants (`/assistants`)

| Method | Endpoint      | Admin | User | Anonymous | Policy      |
| ------ | ------------- | ----- | ---- | --------- | ----------- |
| GET    | `/assistants` | ✅    | ✅   | ❌        | UserOrAdmin |
| POST   | `/assistants` | ✅    | ✅   | ❌        | UserOrAdmin |

**Controller-Level Policy:** None (inherits from BaseController)

**Business Rules:**

-   **Admin Assistants:** Admins create assistants marked as "default" (visible to all users)
-   **User Assistants:** Users create personal assistants (only visible to themselves)
-   **Get Assistants:**
    -   Admins see all default assistants
    -   Users see default assistants + their own personal assistants

---

### Meetings (`/meetings`)

| Method | Endpoint                                        | Admin | User | Anonymous | Policy    |
| ------ | ----------------------------------------------- | ----- | ---- | --------- | --------- |
| GET    | `/meetings/{meetingId}/transcript`              | ✅    | ✅   | ❌        | Authorize |
| GET    | `/meetings/{meetingId}/ai-contents`             | ✅    | ✅   | ❌        | Authorize |
| POST   | `/meetings/{meetingId}/ai-contents`             | ✅    | ✅   | ❌        | Authorize |
| DELETE | `/meetings/{meetingId}/ai-contents/{contentId}` | ✅    | ✅   | ❌        | Authorize |
| POST   | `/meetings/{meetingId}/bot`                     | ✅    | ✅   | ❌        | Authorize |
| POST   | `/meetings/{meetingId}/close`                   | ✅    | ✅   | ❌        | Authorize |
| PUT    | `/meetings/{meetingId}/rename`                  | ✅    | ✅   | ❌        | Authorize |
| PATCH  | `/meetings/{meetingId}/toggle-favorite`         | ✅    | ✅   | ❌        | Authorize |
| PATCH  | `/meetings/{meetingId}/toggle-archive`          | ✅    | ✅   | ❌        | Authorize |
| POST   | `/meetings/{meetingId}/export`                  | ✅    | ✅   | ❌        | Authorize |
| GET    | `/meetings/{meetingId}/public-url`              | ✅    | ✅   | ❌        | Authorize |
| POST   | `/meetings/{meetingId}/public-url`              | ✅    | ✅   | ❌        | Authorize |
| DELETE | `/meetings/{meetingId}/public-url`              | ✅    | ✅   | ❌        | Authorize |

**Controller-Level Policy:** None (inherits from BaseController)

**Business Rules:**

-   All authenticated users can manage their own meetings
-   Organization-scoped: Users only see meetings within their organization
-   Ownership checks performed in handlers (not at controller level)

---

### Reactions (`/reactions`)

| Method | Endpoint     | Admin | User | Anonymous | Policy      |
| ------ | ------------ | ----- | ---- | --------- | ----------- |
| GET    | `/reactions` | ✅    | ✅   | ❌        | UserOrAdmin |

**Controller-Level Policy:** None (inherits from BaseController)

**Business Rules:**

-   All authenticated users can get available reactions
-   Organization-scoped

---

### Authentication (`/authentication`)

| Method | Endpoint                  | Admin | User | Anonymous | Policy         |
| ------ | ------------------------- | ----- | ---- | --------- | -------------- |
| POST   | `/authentication/login`   | ✅    | ✅   | ✅        | AllowAnonymous |
| POST   | `/authentication/logout`  | ✅    | ✅   | ❌        | UserOrAdmin    |
| POST   | `/authentication/refresh` | ✅    | ✅   | ❌        | UserOrAdmin    |

**Controller-Level Policy:** None (inherits from BaseController)

---

### Admin (`/admin`)

| Method | Endpoint       | Admin | User | Anonymous | Policy         |
| ------ | -------------- | ----- | ---- | --------- | -------------- |
| POST   | `/admin/hello` | ✅    | ✅   | ✅        | AllowAnonymous |

**Controller-Level Policy:** None (inherits from BaseController)

**Business Rules:**

-   **First Admin Setup:** This endpoint creates the first admin account and organization
-   Allowed only if no admin exists in the system
-   Returns `Unauthorized` if an admin already exists

---

## Multi-Tenancy & Organization Scoping

All endpoints (except admin creation and authentication) are **organization-scoped**:

-   Users can only access resources within their own organization
-   `OrganizationId` extracted from JWT token
-   Enforced at handler level through `ICurrentUserService.OrganizationId`

## Authorization Flow

```
1. Request → JWT Token Validation
2. Extract Claims: UserId, Role, OrganizationId
3. Policy Check: Does user's role satisfy the policy?
4. Handler Logic: Additional business rules (ownership, org scope, etc.)
5. Response
```

## Future Enhancements

1. **Fine-Grained Permissions:** Move from role-based to permission-based (e.g., `CanInviteUsers`, `CanManageSpaces`)
2. **Resource Ownership Policies:** Custom authorization handlers for owner-or-admin patterns
3. **BotOnly Policy:** Implementation for bot-specific endpoints
4. **Audit Logging:** Track authorization decisions for compliance

---

**Last Updated:** November 18, 2025  
**Branch:** `301-bug-add-permission-and-access-to-pages-and-actions`
