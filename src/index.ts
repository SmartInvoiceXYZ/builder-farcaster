import { getCache, setCache } from '@/cache'
import { env } from '@/config'
import { logger } from '@/logger'
import { getFollowers } from '@/services/warpcast/get-followers'
import { getMe } from '@/services/warpcast/get-me'
import { getVerifications } from '@/services/warpcast/get-verifications'
import { User, Verification } from '@/services/warpcast/types'

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
    let fid = await getCache<number | null>('user_fid', CACHE_MAX_AGE_MS)

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
    let followerFids = await getCache<number[] | null>(
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

    // Fetch verifications for each follower fid and cache them
    for (const followerFid of followerFids) {
      let verificationAddresses = await getCache<string[] | null>(
        // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
        `verifications_${followerFid}`,
        CACHE_MAX_AGE_MS,
      )

      if (verificationAddresses) {
        logger.info(
          { verificationAddresses },
          // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
          `Verification addresses for fid ${followerFid} fetched from cache`,
        )
      } else {
        // Fetch the verifications if not in cache
        const verificationResponse = await getVerifications(env, followerFid)
        verificationAddresses = verificationResponse.verifications.map(
          (verification: Verification) => verification.address,
        )

        // Cache the verification addresses
        // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
        await setCache(`verifications_${followerFid}`, verificationAddresses)
        logger.info(
          { verificationAddresses },
          // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
          `getVerifications function executed and verification addresses cached successfully for fid ${followerFid}`,
        )
      }
    }
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
