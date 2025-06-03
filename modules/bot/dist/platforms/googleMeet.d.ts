import { Page } from "playwright-core";
import { IMeetingPlatform, MeetingConfiguration } from "../types";
export declare class GoogleMeet implements IMeetingPlatform {
    private config;
    private page;
    constructor(config: MeetingConfiguration, page: Page);
    join(): Promise<void>;
    waitForMeetingAdmission: () => Promise<boolean>;
    joinMeeting: (page: Page, meetingUrl: string, botName: string) => Promise<void>;
    leave(): Promise<boolean>;
}
