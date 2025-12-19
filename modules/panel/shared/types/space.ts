import { User } from "./user";

export interface SpaceUser extends User {
  isAdmin: boolean;
}

export interface Space {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
  users: SpaceUser[];
  createdAt?: string;
}

export interface UserInSpace {
  userId: string;
  isAdmin: boolean;
}

export interface CreateSpaceCommand {
  name: string;
  description: string;
  users: UserInSpace[];
}

export interface CreateSpaceResponse {
  id: string;
}

export interface MySpacesResponse {
  id: string;
  name: string;
  description: string;
}

export interface SpaceMember {
  userId: string;
  fullName: string;
  email: string;
  isAdmin: boolean;
  pictureUrl: string;
  joinedAt: string;
  isYou: boolean;
}

export interface SpaceMembersResponse {
  users: SpaceMember[];
}
