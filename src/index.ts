import pino, { Logger } from 'pino'
import { env } from './config'

const logger: Logger = pino()

// Use the validated environment variables
logger.info(`Warpcast Base URL: ${env.WARPCAST_BASE_URL}`)
logger.info(`Using Access Token: ${env.WARPCAST_ACCESS_TOKEN}`)
logger.info(`Running in ${env.NODE_ENV} mode`)
