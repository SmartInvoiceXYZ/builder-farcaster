import pino, { Logger } from 'pino'

export const logger: Logger =
  process.env.NODE_ENV === 'development'
    ? pino({
        transport: {
          target: 'pino-pretty',
          options: {
            colorize: true,
          },
        },
      })
    : pino()
