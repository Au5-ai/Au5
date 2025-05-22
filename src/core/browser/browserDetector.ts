import {Browser} from "../types/browser";
import {Chrome} from "./chromeBrowser";

export class UnknownBrowser extends Browser {
  name = "Unknown";
}

export function detectBrowser(): Browser {
  const userAgent = navigator.userAgent;

  // if (/Edg\//.test(userAgent)) {
  //     return new Edge();
  // }
  // if (/OPR\//.test(userAgent) || /Opera/.test(userAgent)) {
  //     return new Opera();
  // }
  if (/Chrome\//.test(userAgent)) {
    return new Chrome();
  }
  // if (/Firefox\//.test(userAgent)) {
  //     return new Firefox();
  // }
  // if (/Safari\//.test(userAgent)) {
  //     return new Safari();
  // }
  return new UnknownBrowser();
}
