import pino, { Logger } from 'pino'
import { env } from './config'

// Configure the logger
const logger: Logger = pino({
  transport:
    env.NODE_ENV === 'development'
      ? {
          target: 'pino-pretty',
          options: {
            colorize: true, // Enable colors for easier readability
          },
        }
      : undefined,
})

// Example usage of the logger
logger.info(`Warpcast Base URL: ${env.WARPCAST_BASE_URL}`)
logger.info(`Using Access Token: ${env.WARPCAST_ACCESS_TOKEN}`)
logger.info(`Running in ${env.NODE_ENV} mode`)
