import * as winston from 'winston';
import { TransformableInfo } from 'logform';

let logger: winston.Logger;
export { logger };

/**
 * Formats an error through winston correctly to take advantage of
 * source mapping.
 */
function errorFormatter(info: TransformableInfo, opts) {
  const canPrint = logger.levels[info.level] <= logger.levels[logger.level];
  if((info.message as any) instanceof Error && canPrint) {
    console.error(info.message);
  } else if(info instanceof Error && canPrint) {
    console.error(info);
  } else {
    return info;
  }
  // Returning false means we've handled the message.
  return false;
}

// Setup logging
export function setup() {
  logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
      winston.format(errorFormatter)(),
      winston.format.simple()
    ),
    transports: [
      new winston.transports.File({ filename: '.app/winston.log', level: 'info' }),
      new winston.transports.Console()
    ]
  });
}
