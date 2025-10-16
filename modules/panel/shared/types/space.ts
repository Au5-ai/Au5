import { User } from "./user";

export interface SpaceUser extends User {
  isAdmin: boolean;
}

export interface Space {
  id: string;
  name: string;
  description: string;
  parentId: string | null;
  parentName: string | null;
  isActive: boolean;
  childrenCount: number;
  usersCount: number;
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
  parentId?: string;
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
