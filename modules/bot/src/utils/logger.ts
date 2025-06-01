import pino from "pino";

export const logger = pino({
  level: process.env.PINO_LOG_LEVEL || "info",
  timestamp: pino.stdTimeFunctions.isoTime,
});
