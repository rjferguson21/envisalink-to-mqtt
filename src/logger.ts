import { createLogger, LogLevel } from 'bunyan';

export const logger = createLogger({
  name: "envisalink-to-mqtt",
  level: (process.env.log_level || 'info') as LogLevel
});
