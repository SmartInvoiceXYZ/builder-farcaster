import { env } from '@/config'
import { handleActiveProposals } from '@/handlers/proposals-handlers'
import { logger } from '@/logger'

// Log environment information using structured logging
logger.info(
  {
    baseUrl: env.WARPCAST_BASE_URL,
    accessToken:
      env.NODE_ENV !== 'production'
        ? env.WARPCAST_ACCESS_TOKEN
        : 'Access token is set',
    mode: env.NODE_ENV,
  },
  'Environment information',
)

// Handling some application logic with caching
void (async () => {
  await handleActiveProposals()
})()
