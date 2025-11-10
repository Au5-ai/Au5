import { User, UserMenuItem } from "@/shared/types";
import { apiRequestClient } from "../apiRequestClient";
import { API_URLS } from "./urls";
import {
  Settings,
  ClosedCaption,
  ArchiveIcon,
  Brain,
  UserPlus,
  LucideIcon,
  Frame,
} from "lucide-react";

export const userController = {
  me: (): Promise<User> =>
    apiRequestClient<User>(API_URLS.USERS.ME, { method: "GET" }),
  myMenu: async (): Promise<UserMenuItem[]> => {
    const menu = await apiRequestClient<UserMenuItem[]>(
      API_URLS.USERS.MY_MENU,
      { method: "GET" },
    );
    return menu.map(mapMenuItem);
  },
  find: (query: string): Promise<User[]> =>
    apiRequestClient<User[]>(
      `${API_URLS.USERS.SEARCH}?query=${encodeURIComponent(query)}`,
      { method: "GET" },
    ),
};

const iconMap: Record<string, LucideIcon> = {
  ClosedCaption: ClosedCaption,
  ArchiveIcon: ArchiveIcon,
  Brain: Brain,
  Settings: Settings,
  UserPlus: UserPlus,
  Frame: Frame,
};

function mapMenuItem(serverItem: UserMenuItem | undefined): UserMenuItem {
  if (!serverItem) {
    return {} as UserMenuItem;
  }
  return {
    ...serverItem,
    lucideIcon: iconMap[serverItem.icon],
    children: serverItem.children?.map(mapMenuItem),
  };
}
