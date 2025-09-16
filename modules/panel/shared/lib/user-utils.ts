import { Crown, User } from "lucide-react";

export interface RoleDisplay {
  label: string;
  color: string;
  icon: typeof Crown | typeof User;
}

export const getRoleDisplay = (role: number): RoleDisplay => {
  return role === 1
    ? {
        label: "Admin",
        color:
          "bg-gradient-to-r from-purple-100 to-violet-100 text-purple-800 border-purple-200",
        icon: Crown,
      }
    : {
        label: "User",
        color:
          "bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 border-blue-200",
        icon: User,
      };
};

export const getRoleType = (role: string): number => {
  if (role === "user") {
    return 2;
  } else if (role === "admin") {
    return 1;
  }
  return 0;
};
