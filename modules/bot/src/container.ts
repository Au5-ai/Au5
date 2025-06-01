import { ErrorMessages } from "./constants";
import { MeetingConfiguration } from "./types";

async function main() {
  const rawConfig = process.env.BOT_CONFIG;
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
    await runBot(parsedConfig);
  } catch (error) {
    console.error(ErrorMessages.RUNNING_BOT, error);
    process.exit(1);
  }
}

main();
