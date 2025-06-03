export declare class ErrorMessages {
    static readonly MEETING_CONFIG_NOT_SET = "MeetingConfiguration environment variable not set.";
    static readonly INVALID_MEETING_CONFIG_JSON = "Invalid JSON in MeetingConfiguration environment variable.";
    static readonly RUNNING_BOT = "Error running the bot with the provided configuration.";
    static browserCloseError: (err: unknown) => string;
}
export declare namespace LogMessages {
    const Program: {
        readonly browserRequested: "[Program] Browser requested graceful shutdown.";
        readonly shutdownAlreadyInProgress: "[Program] Shutdown already in progress.";
        readonly closingBrowserInstance: "[Program] Closing browser instance.";
    };
}
export declare const USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36";
export declare const BROWSER_ARGS: string[];
