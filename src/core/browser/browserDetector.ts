import {IBrowser} from "../types/browser";
import {Chrome} from "./chromeBrowser";

export function detectBrowser(): IBrowser {
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
  return new Chrome();
}
