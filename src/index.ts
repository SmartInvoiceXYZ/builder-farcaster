import { getFollowers } from '@/services/warpcast/get-followers'
import { User } from '@/services/warpcast/types'
import { getCache, setCache } from './cache'
import { env } from './config'
import { logger } from './logger'
import { getMe } from './services/warpcast/get-me'

// Constants
const CACHE_MAX_AGE_MS = 86400 * 1000 // 1 day in milliseconds

// Log environment information using structured logging
logger.info({ baseUrl: env.WARPCAST_BASE_URL }, 'Warpcast Base URL')
if (env.NODE_ENV !== 'production') {
  logger.info({ accessToken: env.WARPCAST_ACCESS_TOKEN }, 'Using Access Token')
} else {
  logger.info('Access token is set')
}
logger.info({ mode: env.NODE_ENV }, 'Application running mode')

// Example of handling some application logic with caching
void (async () => {
  try {
    // Attempt to get cached user fid
    let fid = await getCache<number>('user_fid', CACHE_MAX_AGE_MS)

    if (fid) {
      logger.info('User fid fetched from cache')
    } else {
      // Fetch the user if fid is not in cache
      const response = await getMe(env)
      fid = response.user.fid
      // Cache only the fid of the user
      await setCache('user_fid', fid)
      logger.info(
        { fid },
        'getMe function executed and fid cached successfully',
      )
    }

    // Assuming that fid will not be null or undefined at this point
    // Fetch followers and use caching as well
    let followerFids = await getCache<number[]>(
      // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
      `followers_fids_${fid}`,
      CACHE_MAX_AGE_MS,
    )

    if (followerFids) {
      logger.info('Follower fids fetched from cache')
    } else {
      // Fetch the followers if not in cache
      const response = await getFollowers(env, fid)
      followerFids = response.users.map((user: User) => user.fid) // Extract fids only
      // Cache the result
      // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
      await setCache(`followers_fids_${fid}`, followerFids)
      logger.info(
        { followerFids },
        'getFollowers function executed and follower fids cached successfully',
      )
    }

    // Example usage of the follower fids
    logger.info({ followerFids }, 'Follower fids processed successfully')
  } catch (error) {
    if (error instanceof Error) {
      logger.error(
        { message: error.message, stack: error.stack },
        'Error executing async function',
      )
    } else {
      logger.error({ error }, 'Unknown error occurred')
    }
  }
})()
