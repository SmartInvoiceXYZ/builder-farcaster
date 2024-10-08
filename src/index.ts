import dotenv from 'dotenv'
import pino, { Logger } from 'pino'

dotenv.config()

const logger: Logger = pino()

logger.info('Hello World')
