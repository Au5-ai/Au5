import { Page } from "playwright-core";
import { IMeetingPlatform, MeetingConfiguration } from "../types";
import { logger } from "../utils/logger";

export class GoogleMeet implements IMeetingPlatform {
  constructor(private config: MeetingConfiguration, private page: Page) {}

  async function handleGoogleMeet(
    botConfig: BotConfig,
    page: Page
  ): Promise<void> {
    const leaveButton = `//button[@aria-label="Leave call"]`;
  
    if (!botConfig.meetingUrl) {
      logger.info("Error: Meeting URL is required for Google Meet but is null.");
      return;
    }
  
    logger.info("Joining Google Meet");
    try {
      await joinMeeting(page, botConfig.meetingUrl, botConfig.botName);
    } catch (error: any) {
      console.error(error.message);
      return;
    }
  
    // Setup websocket connection and meeting admission concurrently
    logger.info("Starting WebSocket connection while waiting for meeting admission");
    try {
      // Run both processes concurrently
      const [isAdmitted] = await Promise.all([
        // Wait for admission to the meeting
        waitForMeetingAdmission(
          page,
          leaveButton,
          botConfig.automaticLeave.waitingRoomTimeout
        ).catch((error) => {
          logger.info("Meeting admission failed: " + error.message);
          return false;
        }),
  
        // Prepare for recording (expose functions, etc.) while waiting for admission
        prepareForRecording(page),
      ]);
  
      if (!isAdmitted) {
        console.error("Bot was not admitted into the meeting");
        return;
      }
  
      logger.info("Successfully admitted to the meeting, starting recording");
      // Pass platform from botConfig to startRecording
      await startRecording(page, botConfig);
    } catch (error: any) {
      console.error(error.message);
      return;
    }
  }
  
  // New function to wait for meeting admission
  const waitForMeetingAdmission = async (
    page: Page,
    leaveButton: string,
    timeout: number
  ): Promise<boolean> => {
    try {
      await page.waitForSelector(leaveButton, { timeout });
      logger.info("Successfully admitted to the meeting");
      return true;
    } catch {
      throw new Error(
        "Bot was not admitted into the meeting within the timeout period"
      );
    }
  };
  
  const joinMeeting = async (page: Page, meetingUrl: string, botName: string) => {
    const enterNameField = 'input[type="text"][aria-label="Your name"]';
    const joinButton = '//button[.//span[text()="Ask to join"]]';
    const muteButton = '[aria-label*="Turn off microphone"]';
    const cameraOffButton = '[aria-label*="Turn off camera"]';
  
    await page.goto(meetingUrl, { waitUntil: "networkidle" });
    await page.bringToFront();
  
    // Add a longer, fixed wait after navigation for page elements to settle
    logger.info("Waiting for page elements to settle after navigation...");
    await page.waitForTimeout(5000); // Wait 5 seconds
  
    // Enter name and join
    // Keep the random delay before interacting, but ensure page is settled first
    await page.waitForTimeout(randomDelay(1000));
    logger.info("Attempting to find name input field...");
    // Increase timeout drastically
    await page.waitForSelector(enterNameField, { timeout: 120000 }); // 120 seconds
    logger.info("Name input field found.");
  
    await page.waitForTimeout(randomDelay(1000));
    await page.fill(enterNameField, botName);
  
    // Mute mic and camera if available
    try {
      await page.waitForTimeout(randomDelay(500));
      await page.click(muteButton, { timeout: 200 });
      await page.waitForTimeout(200);
    } catch (e) {
      logger.info("Microphone already muted or not found.");
    }
    try {
      await page.waitForTimeout(randomDelay(500));
      await page.click(cameraOffButton, { timeout: 200 });
      await page.waitForTimeout(200);
    } catch (e) {
      logger.info("Camera already off or not found.");
    }
  
    await page.waitForSelector(joinButton, { timeout: 60000 });
    await page.click(joinButton);
    logger.info(`${botName} joined the Meeting.`);
  };
  
 
  // Remove the compatibility shim 'recordMeeting' if no longer needed,
  // otherwise, ensure it constructs a valid BotConfig object.
  // Example if keeping:
  /*
  const recordMeeting = async (page: Page, meetingUrl: string, token: string, connectionId: string, platform: "google_meet" | "zoom" | "teams") => {
    await prepareForRecording(page);
    // Construct a minimal BotConfig - adjust defaults as needed
    const dummyConfig: BotConfig = {
        platform: platform,
        meetingUrl: meetingUrl,
        botName: "CompatibilityBot",
        token: token,
        connectionId: connectionId,
        nativeMeetingId: "", // Might need to derive this if possible
        automaticLeave: { waitingRoomTimeout: 300000, noOneJoinedTimeout: 300000, everyoneLeftTimeout: 300000 },
    };
    await startRecording(page, dummyConfig);
  };
  */
  
  // --- ADDED: Exported function to trigger leave from Node.js ---
  export async function leaveGoogleMeet(page: Page): Promise<boolean> {
    logger.info("[leaveGoogleMeet] Triggering leave action in browser context...");
    if (!page || page.isClosed()) {
      logger.info("[leaveGoogleMeet] Page is not available or closed.");
      return false;
    }
    try {
      // Call the function exposed within the page's evaluate context
      const result = await page.evaluate(async () => {
        if (typeof (window as any).performLeaveAction === "function") {
          return await (window as any).performLeaveAction();
        } else {
          (window as any).logger.infoBot?.(
            "[Node Eval Error] performLeaveAction function not found on window."
          );
          console.error(
            "[Node Eval Error] performLeaveAction function not found on window."
          );
          return false;
        }
      });
      logger.info(`[leaveGoogleMeet] Browser leave action result: ${result}`);
      return result; // Return true if leave was attempted, false otherwise
    } catch (error: any) {
      logger.info(
        `[leaveGoogleMeet] Error calling performLeaveAction in browser: ${error.message}`
      );
      return false;
    }
  }
}