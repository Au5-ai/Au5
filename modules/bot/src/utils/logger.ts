import pino from "pino";

export const logger = pino({
  level: process.env.PINO_LOG_LEVEL || "debug",
  timestamp: pino.stdTimeFunctions.isoTime,
});
