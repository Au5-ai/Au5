import { ErrorMessages } from "./common/constants";
import { addNewBotToMeeting } from "./botManager";
import { MeetingConfiguration } from "./types";
import fetch, { Headers, Request, Response } from "node-fetch";
import { logger } from "./common/utils/logger";

(global as any).fetch = fetch;
(global as any).Headers = Headers;
(global as any).Request = Request;
(global as any).Response = Response;

async function loadConfig(): Promise<MeetingConfiguration> {
  const rawConfig = process.env.MEETING_CONFIG;

  if (!rawConfig) {
    logger.error(ErrorMessages.MEETING_CONFIG_NOT_SET);
    process.exit(1);
  }

  try {
    return JSON.parse(rawConfig) as MeetingConfiguration;
  } catch (error) {
    logger.error(
      `${ErrorMessages.INVALID_MEETING_CONFIG_JSON}: ${
        error instanceof Error ? error.message : error
      }`
    );
    process.exit(1);
  }
}

async function main() {
  logger.info("🚀 Starting Meeting Bot...");
  const config = await loadConfig();
  try {
    await addNewBotToMeeting(config);
  } catch (error) {
    logger.error(
      `${ErrorMessages.RUNNING_BOT}: ${
        error instanceof Error ? error.message : error
      }`
    );
    process.exit(1);
  }
  logger.info("✅ Meeting Bot started successfully.");
}

main().catch((err) => {
  logger.error("Unexpected error occurred while starting the bot:", err);
  process.exit(1);
});
