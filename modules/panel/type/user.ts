export type UserRole = "admin" | "user";

export interface User {
  id: string;
  fullName: string;
  pictureUrl?: string;
  hasAccount: boolean;
  email: string;
}

export interface Participant {
  id: string;
  fullName: string;
  pictureUrl: string;
  email: string;
  hasAccount: boolean;
}

// export interface User {
//   id: string;
//   fullName: string;
//   email: string;
//   pictureUrl?: string;
//   role: UserRole;
//   createdAt: string;
//   lastLoginAt?: string;
//   lastPasswordChangeAt?: string;
//   isValid: boolean;
// }

export interface InviteUserRequest {
  email: string;
  fullName: string;
  role: UserRole;
}

export interface UpdateUserRequest {
  fullName?: string;
  role?: UserRole;
  isValid?: boolean;
}

export interface UsersState {
  users: User[];
  loading: boolean;
  error: string | null;
  currentPage: number;
  totalPages: number;
  totalCount: number;
}
