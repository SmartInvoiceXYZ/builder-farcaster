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

/**
 * Retrieves the follower FIDs (unique follower IDs) for a given FID (unique ID).
 * The method attempts to fetch the follower FIDs from the cache first. If they are not
 * found in the cache, it fetches them from the source and caches the result for future use.
 * @param fid - The unique ID for which to find the follower FIDs.
 * @returns - A promise that resolves to an array of follower FIDs.
 */
async function getFollowerFids(fid: number) {
  let followerFids = await getCache<number[] | null>(
    `followers_fids_${fid.toString()}`,
    CACHE_MAX_AGE_MS,
  )

  if (followerFids) {
    logger.debug({ fid, followerFids }, 'Follower FIDs fetched from cache')
  } else {
    const response = await getFollowers(env, fid)
    followerFids = response.users.map((user) => user.fid) // Extract FIDs only
    await setCache(`followers_fids_${fid.toString()}`, followerFids)
    logger.info(
      { fid, followerFids },
      'Follower FIDs fetched and cached successfully',
    )
  }
  return followerFids
}

/**
 * Retrieves the follower's verification addresses from cache or fetches them if not found in cache.
 * @param follower - The Follower's unique identifier.
 * @returns - A promise that resolves to an array of verification addresses.
 */
async function getFollowerAddresses(follower: number) {
  const cacheKey = `addresses_${follower.toString()}`
  let addresses = await getCache<string[] | null>(cacheKey, CACHE_MAX_AGE_MS)

  if (addresses) {
    logger.debug({ follower, addresses }, 'Addresses fetched from cache')
  } else {
    const verificationResponse = await getVerifications(env, follower)
    addresses = verificationResponse.verifications.map(
      (verification) => verification.address,
    )
    await setCache(cacheKey, addresses)
    logger.info(
      { follower, addresses },
      'Addresses fetched and cached successfully',
    )
  }
  return addresses
}

/**
 * Fetches the DAO (Decentralized Autonomous Organization) identifiers associated with a given follower ID.
 * The method first attempts to retrieve these identifiers from cache; if not present, it fetches them
 * using the provided verification addresses, caches the result, and then returns the identifiers.
 * @param follower - The unique identifier of the follower.
 * @param addresses - An array of addresses used to verify ownership.
 * @returns A promise that resolves to an array of DAO identifiers, or null if none are found.
 */
async function getFollowerDAOs(follower: number, addresses: string[]) {
  const cacheKey = `dao_ids_${follower.toString()}`
  let daoIds = await getCache<string[] | null>(cacheKey, CACHE_MAX_AGE_MS)

  if (daoIds) {
    logger.debug(
      { followerFid: follower, daoIds },
      'DAO IDs fetched from cache',
    )
  } else {
    if (addresses.length > 0) {
      const daoResponse = await getDAOsForOwners(env, addresses)
      daoIds = daoResponse.daos.map((dao) => dao.id) // Extract DAO IDs only
      await setCache(cacheKey, daoIds)
      logger.info(
        { follower, daoIds },
        'DAO IDs fetched and cached successfully',
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
  const cacheKey = 'user_fid'
  let fid = await getCache<number | null>(cacheKey, CACHE_MAX_AGE_MS)

  if (fid) {
    logger.debug({ fid }, 'User FID fetched from cache')
  } else {
    const response = await getMe(env)
    fid = response.user.fid
    await setCache(cacheKey, fid)
    logger.info({ fid }, 'User FID fetched and cached successfully')
  }
  return fid
}

// Example of handling some application logic with caching
void (async () => {
  try {
    const followers = await getFollowerFids(await getUserFid())
    for (const follower of followers) {
      const addresses = await getFollowerAddresses(follower)
      const daos = await getFollowerDAOs(follower, addresses)

      if (addresses.length > 0 && daos && daos.length > 0) {
        logger.debug(
          { follower, addresses, daos },
          'Follower with address and DAOs processed',
        )
      }
    }

    const nowDateTime = DateTime.now()
    const timeCacheKey = 'proposals_time'
    let proposalsTime =
      (await getCache<number | null>(timeCacheKey, CACHE_MAX_AGE_MS)) ??
      nowDateTime.minus({ week: 1 }).toUnixInteger()

    const { proposals } = await getActiveProposals(env, proposalsTime)
    logger.info(
      { proposalsTime, proposals },
      'Active proposals fetched successfully',
    )

    proposalsTime = nowDateTime.toUnixInteger()
    await setCache(timeCacheKey, proposalsTime)
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
