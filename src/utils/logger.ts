export interface LogPayload {
  level: "info" | "warn" | "error";
  message: string;
  context?: string;
  extensionVersion?: string;
  userId?: string;
  timestamp?: string;
}

export class Logger {
  private static async log(payload: LogPayload): Promise<void> {
    try {
      const fullPayload = {
        ...payload,
        timestamp: new Date().toISOString(),
        extensionVersion: "1.0.0",
        userId: "23f45e89-8b5a-5c55-9df7-240d78a3ce15" // This should be replaced with actual user ID logic
      };
      console.log(fullPayload);
    } catch (error) {
      console.warn("[RemoteLogger] Failed to send log", error);
    }
  }

  static info(message: string, context?: string) {
    this.log({level: "info", message, context});
  }

  static warn(message: string, context?: string) {
    this.log({level: "warn", message, context});
  }

  static error(message: string, context?: string) {
    this.log({level: "error", message, context});
  }
}
