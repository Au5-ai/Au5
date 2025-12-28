import { Chrome, Gem, Info } from "lucide-react";
import { ROUTES } from "../routes";

const navSecondary = [
  {
    title: "Install Chrome Extension",
    url: ROUTES.EXTENSION_LINK,
    icon: Chrome,
    checkVersion: true,
  },
  {
    title: "Request a Feature",
    url: "https://github.com/Au5-ai/au5/issues",
    icon: Gem,
  },
  {
    title: "About Riter",
    action: "about",
    icon: Info,
  },
];
export { navSecondary };
