import { WinstonModule } from 'nest-winston';
import * as winston from 'winston';

export const createLogger = (serviceName: string) => {
  return WinstonModule.createLogger({
    transports: [
      new winston.transports.Console({
        format: winston.format.combine(
          winston.format.timestamp(),
          winston.format.ms(),
          winston.format.colorize({ all: true }),
          winston.format.printf(({ timestamp, level, message, context, ms, ...meta }) => {
            const metaString = Object.keys(meta).length ? JSON.stringify(meta) : '';
            return `[${serviceName}] ${timestamp} [${level}] [${context || 'Application'}] ${message} ${ms} ${metaString}`;
          }),
        ),
      }),
      new winston.transports.File({
        filename: `logs/${serviceName}-error.log`,
        level: 'error',
        format: winston.format.combine(
          winston.format.timestamp(),
          winston.format.json(),
        ),
      }),
      new winston.transports.File({
        filename: `logs/${serviceName}-combined.log`,
        format: winston.format.combine(
          winston.format.timestamp(),
          winston.format.json(),
        ),
      }),
    ],
  });
};
