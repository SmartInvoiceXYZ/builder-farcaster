import { getCache, setCache } from '@/cache'
import { env } from '@/config'
import { logger } from '@/logger'
import { getActiveProposals } from '@/services/builder/get-active-proposals'
import { getDAOsForOwners } from '@/services/builder/get-daos-for-owners'
import { getFollowers } from '@/services/warpcast/get-followers'
import { getMe } from '@/services/warpcast/get-me'
import { getVerifications } from '@/services/warpcast/get-verifications'
import { DateTime } from 'luxon'

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

/**
 * Retrieves the follower FIDs (unique follower IDs) for a given FID (unique ID).
 * The method attempts to fetch the follower FIDs from the cache first. If they are not
 * found in the cache, it fetches them from the source and caches the result for future use.
 * @param fid - The unique ID for which to find the follower FIDs.
 * @returns - A promise that resolves to an array of follower FIDs.
 */
async function getFollowerFids(fid: number) {
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
  return followerFids
}

/**
 * Retrieves the follower's verification addresses from cache or fetches them if not found in cache.
 * @param followerFid - The Follower's unique identifier.
 * @returns - A promise that resolves to an array of verification addresses.
 */
async function getFollowerAddresses(followerFid: number) {
  let verificationAddresses = await getCache<string[] | null>(
    `verifications_${followerFid.toString()}`,
    CACHE_MAX_AGE_MS,
  )

  if (verificationAddresses) {
    logger.info(
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
  return verificationAddresses
}

/**
 * Fetches the DAO (Decentralized Autonomous Organization) identifiers associated with a given follower ID.
 * The method first attempts to retrieve these identifiers from cache; if not present, it fetches them
 * using the provided verification addresses, caches the result, and then returns the identifiers.
 * @param followerFid - The unique identifier of the follower.
 * @param verificationAddresses - An array of addresses used to verify ownership.
 * @returns A promise that resolves to an array of DAO identifiers, or null if none are found.
 */
async function getFollowerDAOs(
  followerFid: number,
  verificationAddresses: string[],
) {
  // Fetch DAOs for each follower fid using verification addresses and cache DAO ids only
  let daoIds = await getCache<string[] | null>(
    `dao_ids_${followerFid.toString()}`,
    CACHE_MAX_AGE_MS,
  )

  if (daoIds) {
    logger.info(`DAO ids for fid ${followerFid.toString()} fetched from cache`)
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

  return daoIds
}

/**
 * Retrieves the user's FID (Federated ID). This function first attempts to fetch the
 * FID from a cache. If the FID is not found in the cache, it fetches the FID via
 * the `getMe` function and then stores it in the cache for future requests.
 * @returns A promise that resolves to the user's FID.
 */
async function getUserFid() {
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
    logger.info({ fid }, 'getMe function executed and fid cached successfully')
  }
  return fid
}

// Example of handling some application logic with caching
void (async () => {
  try {
    const nowDateTime = DateTime.now()
    let proposalsTime =
      (await getCache<number | null>('proposals_time', CACHE_MAX_AGE_MS)) ??
      nowDateTime.minus({ week: 1 }).toUnixInteger()

    const { proposals } = await getActiveProposals(env, proposalsTime)
    logger.info(
      { proposalsTime, proposals },
      'Active proposals fetched successfully',
    )

    const fid = await getUserFid()

    const followers = await getFollowerFids(fid)

    for (const follower of followers) {
      const addresses = await getFollowerAddresses(follower)
      const daos = await getFollowerDAOs(follower, addresses)

      logger.info(
        { daos },
        `DAO ids for follower fid ${follower.toString()} fetched and processed`,
      )
    }

    proposalsTime = nowDateTime.toUnixInteger()
    await setCache('proposals_time', proposalsTime)
    logger.info({ proposalsTime }, 'Proposals time cached successfully')
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
