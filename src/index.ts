import { env } from './config'
import { logger } from './logger'
import { getMe } from './services/warpcast/get-me'

// Log environment information using structured logging
logger.info({ baseUrl: env.WARPCAST_BASE_URL }, 'Warpcast Base URL')
logger.info({ accessToken: env.WARPCAST_ACCESS_TOKEN }, 'Using Access Token')
logger.info({ mode: env.NODE_ENV }, 'Application running mode')

// Example of handling some application logic
void (async () => {
  try {
    // Suppose this is where you would make some async call
    const result = await getMe(env)
    logger.info({ result }, 'getMe function executed successfully')
  } catch (error) {
    logger.error({ error }, 'Error executing async function')
  }
})()
