import { ErrorMessages } from "./common/constants";
import { startMeetingBot } from "./botManager";
import { MeetingConfiguration } from "./types";

import fetch, { Headers, Request, Response } from "node-fetch";
import { logger } from "./common/utils/logger";
(global as any).fetch = fetch;
(global as any).Headers = Headers;
(global as any).Request = Request;
(global as any).Response = Response;

async function main() {
  logger.info("Starting Meeting Bot...");
  const rawConfig = process.env.MEETING_CONFIG;
  if (!rawConfig) {
    logger.error(ErrorMessages.MEETING_CONFIG_NOT_SET);
    process.exit(1);
  }

  let parsedConfig: MeetingConfiguration;

  try {
    parsedConfig = JSON.parse(rawConfig);
  } catch (error) {
    logger.error(ErrorMessages.INVALID_MEETING_CONFIG_JSON, error);
    process.exit(1);
  }

  try {
    await startMeetingBot(parsedConfig);
  } catch (error) {
    logger.error(ErrorMessages.RUNNING_BOT, error);
    process.exit(1);
  }
}

main();
