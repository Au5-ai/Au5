import { ErrorMessages, MEETING_CONFIG } from "./common/constants";
import { startMeetingBot } from "./botManager";
import { MeetingConfiguration } from "./types";

//process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = "0";
import fetch, { Headers, Request, Response } from "node-fetch";
(global as any).fetch = fetch;
(global as any).Headers = Headers;
(global as any).Request = Request;
(global as any).Response = Response;

async function main() {
  //const rawConfig = MEETING_CONFIG;
  const rawConfig = process.env.MEETING_CONFIG;
  if (!rawConfig) {
    console.error(ErrorMessages.MEETING_CONFIG_NOT_SET);
    process.exit(1);
  }

  let parsedConfig: MeetingConfiguration;

  try {
    parsedConfig = JSON.parse(rawConfig);
  } catch (error) {
    console.error(ErrorMessages.INVALID_MEETING_CONFIG_JSON, error);
    process.exit(1);
  }

  try {
    await startMeetingBot(parsedConfig);
  } catch (error) {
    console.error(ErrorMessages.RUNNING_BOT, error);
    process.exit(1);
  }
}

main();
