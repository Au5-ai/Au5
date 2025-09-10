# User Management System - Feature Specification

## 1. Overview

A comprehensive user management interface with advanced data grid capabilities, real-time analytics dashboard, and smart user invitation system.

## 2. Dashboard Statistics Component

- **Position**: Prominent display at top of page
- **Metrics**:
  - Total Users (count)
  - Active Users (isValid=true + lastLoginAt within 30 days)
  - Administrators (role=admin count)
  - Inactive Users (isValid=false OR lastLoginAt > 90 days)
- **Visual Design**: Card-based layout with trend indicators

## 3. Modern Data Grid Implementation

- **Component**: shadcnUI implementation
- **Core Features**:

  - Client-side sorting (all columns)

- **UI Elements**:
  - Status badges with color coding (active/inactive)
  - Role badges with distinctive colors gradiant color
  - Action menu on each row (Edit, Enable/Disable, View Activity)
  - Hover states and visual feedback

## 4. Smart User Invitation System

- **Access**: Modal triggered by "Invite Users" button
- **Input Mechanism**:

  - Tag-like badge system for multiple email entry
  - Email validation (format and uniqueness)
  - Auto-complete from existing domains or show the email as fix value.

- **Role Assignment**:
  - Dropdown with role descriptions
  - Default role: User
- **Confirmation Flow**:
  - Preview of invitations before sending
  - Summary of successful/failed invitations

## 5. Advanced Search & Filter System

- **Search Interface**:
  - Auto-complete suggestions for names and emails
  - Filter chips display for active filters
- **Filter Categories**:
  - Status (active/inactive)
  - Role (admin/user)
  - Date ranges (createdAt, lastLoginAt)

## 6. User Actions & Operations

- **Row-Level Actions**:
  - Enable/Disable toggle with confirmation dialog
  - Edit user modal form with validation

## 7. Technical Implementation Details

### Validation Rules

- Email format validation (RFC 5322 standard)

## Data Model

- fullName: string (required)
- email: string (required, unique)
- pictureUrl : string url
- role: enum (admin, user)
- createdAt: datetime
- lastLoginAt : datetime
- lastPasswordChangeAt : datetime
- isValid: boolean
