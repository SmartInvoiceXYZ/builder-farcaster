import pino, { Logger } from 'pino'

const logLevel = process.env.NODE_ENV === 'development' ? 'debug' : 'info'

export const logger: Logger =
  process.env.NODE_ENV === 'development'
    ? pino({
        level: logLevel,
        transport: {
          target: 'pino-pretty',
          options: {
            colorize: true,
          },
        },
      })
    : pino({ level: logLevel })
