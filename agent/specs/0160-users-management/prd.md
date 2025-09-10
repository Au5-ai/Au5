: # User Management System - PRD

## Overview

A user management interface with data grid display and user management capabilities.

## Features

1. User Data Grid Display
2. User Actions (Enable/Disable/Edit)
3. Add New User via Email Invitation with selection the Role

## User Roles

- Admin: Full access to all features
- User: Read-only access to own data

## Data Model

- fullName: string (required)
- email: string (required, unique)
- pictureUrl : string url
- role: enum (admin, user)
- createdAt: datetime
- lastLoginAt : datetime
- lastPasswordChangeAt : datetime
- isValid: boolean

## Technical Stack

- Frontend: React / Next / shadcn UI
- Backend: Asp.net REST API located in module/backend
