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

export interface Member {
  userId: string;
  fullName: string;
  email: string;
  pictureUrl: string;
}

export interface SpaceMember extends Member {
  isAdmin: boolean;
  joinedAt: string;
  isYou: boolean;
}

export interface SpaceMembersResponse {
  users: SpaceMember[];
}
