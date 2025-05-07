export interface LogPayload {
  level: "info" | "warn" | "error";
  message: string;
  context?: string;
  extensionVersion?: string;
  userId?: string;
  timestamp?: string;
}

export class RemoteLogger {
  async log(payload: LogPayload): Promise<void> {
    try {
      const fullPayload = {
        ...payload,
        timestamp: new Date().toISOString(),
        extensionVersion: "1.0.0" // replace with dynamic version if needed
      };

      await fetch(this.endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(fullPayload)
      });
    } catch (error) {
      // fallback to console
      console.warn("[RemoteLogger] Failed to send log", error);
    }
  }

  info(message: string, context?: string) {
    this.log({level: "info", message, context});
  }

  warn(message: string, context?: string) {
    this.log({level: "warn", message, context});
  }

  error(message: string, context?: string) {
    this.log({level: "error", message, context});
  }
}
