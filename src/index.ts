import { getCache, setCache } from '@/cache'
import { env } from '@/config'
import { logger } from '@/logger'
import { getDAOsForOwners } from '@/services/builder/get-daos-for-owners'
import { getFollowers } from '@/services/warpcast/get-followers'
import { getMe } from '@/services/warpcast/get-me'
import { getVerifications } from '@/services/warpcast/get-verifications'

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
      `followers_fids_${fid.toString()}`,
      CACHE_MAX_AGE_MS,
    )

    if (followerFids) {
      logger.info('Follower fids fetched from cache')
    } else {
      // Fetch the followers if not in cache
      const response = await getFollowers(env, fid)
      followerFids = response.users.map((user) => user.fid) // Extract fids only
      // Cache the result
      await setCache(`followers_fids_${fid.toString()}`, followerFids)
      logger.info(
        { followerFids },
        'getFollowers function executed and follower fids cached successfully',
      )
    }

    // Fetch verifications for each follower fid and cache them
    for (const followerFid of followerFids) {
      let verificationAddresses = await getCache<string[] | null>(
        `verifications_${followerFid.toString()}`,
        CACHE_MAX_AGE_MS,
      )

      if (verificationAddresses) {
        logger.info(
          { verificationAddresses },
          `Verification addresses for fid ${followerFid.toString()} fetched from cache`,
        )
      } else {
        // Fetch the verifications if not in cache
        const verificationResponse = await getVerifications(env, followerFid)
        verificationAddresses = verificationResponse.verifications.map(
          (verification) => verification.address,
        )

        // Cache the verification addresses
        await setCache(
          `verifications_${followerFid.toString()}`,
          verificationAddresses,
        )
        logger.info(
          { verificationAddresses },
          `getVerifications function executed and verification addresses cached successfully for fid ${followerFid.toString()}`,
        )
      }

      // Fetch DAOs for each follower fid using verification addresses and cache DAO ids only
      let daoIds = await getCache<string[] | null>(
        `dao_ids_${followerFid.toString()}`,
        CACHE_MAX_AGE_MS,
      )

      if (daoIds) {
        logger.info(
          { daoIds },
          `DAO ids for fid ${followerFid.toString()} fetched from cache`,
        )
      } else {
        // Fetch DAOs if not in cache
        if (verificationAddresses.length > 0) {
          const daoResponse = await getDAOsForOwners(env, verificationAddresses)
          daoIds = daoResponse.daos.map((dao) => dao.id) // Extract DAO ids only

          // Cache the DAO ids
          await setCache(`dao_ids_${followerFid.toString()}`, daoIds)
          logger.info(
            { daoIds },
            `getDAOsForOwners function executed and DAO ids cached successfully for fid ${followerFid.toString()}`,
          )
        }
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
