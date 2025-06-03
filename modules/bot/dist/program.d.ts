import { MeetingConfiguration } from "./types";
/**
 * Starts the meeting bot with the specified configuration.
 *
 * This function initializes the browser with stealth plugins to avoid detection,
 * sets up the browser context with required permissions, and navigates to the
 * appropriate meeting platform based on the provided configuration.
 *
 * Supported platforms:
 * - "google_meet"
 * - "zoom" (currently not implemented)
 * - "teams" (currently not implemented)
 *
 * @param config - The configuration object for the meeting bot, including platform,
 *   meeting URL, bot display name, language, and meeting ID.
 * @returns A promise that resolves when the bot has finished execution or is awaiting
 *   further commands.
 * @throws {Error} If an unsupported platform is specified in the configuration.
 */
export declare function startMeetingBot(config: MeetingConfiguration): Promise<void>;
