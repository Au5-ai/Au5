import { LucideIcon } from "lucide-react";

export type UserRole = 1 | 2;

export interface UserMenuItem {
  id: string;
  title: string;
  icon: string;
  lucideIcon?: LucideIcon;
  url: string;
  showBadge: boolean;
  badge?: string;
  children?: UserMenuItem[];
}

export interface User {
  id: string;
  fullName: string;
  pictureUrl?: string;
  email: string;
}

export interface Participant {
  id: string;
  fullName: string;
  pictureUrl: string;
  email: string;
}

export interface UserListItem {
  id: string;
  fullName: string;
  email: string;
  role: UserRole;
  createdAt: Date;
  isActive: boolean;
  pictureUrl?: string;
  lastLoginAt?: Date;
  lastPasswordChangeAt?: Date;
}

export interface InviteUserPayload {
  email: string;
  fullName: string;
  role: UserRole;
}

export interface UsersState {
  users: User[];
  loading: boolean;
  error: string | null;
  currentPage: number;
  totalPages: number;
  totalCount: number;
}
