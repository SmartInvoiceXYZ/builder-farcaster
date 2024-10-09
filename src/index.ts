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
logger.info('Environment information', {
  baseUrl: env.WARPCAST_BASE_URL,
  accessToken:
    env.NODE_ENV !== 'production'
      ? env.WARPCAST_ACCESS_TOKEN
      : 'Access token is set',
  mode: env.NODE_ENV,
})

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
    logger.debug('Follower FIDs fetched from cache', { fid, followerFids })
  } else {
    const response = await getFollowers(env, fid)
    followerFids = response.users.map((user) => user.fid) // Extract FIDs only
    await setCache(`followers_fids_${fid.toString()}`, followerFids)
    logger.info('Follower FIDs fetched and cached successfully', {
      fid,
      followerFids,
    })
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
    logger.debug('Verification addresses fetched from cache', {
      followerFid,
      verificationAddresses,
    })
  } else {
    const verificationResponse = await getVerifications(env, followerFid)
    verificationAddresses = verificationResponse.verifications.map(
      (verification) => verification.address,
    )
    await setCache(
      `verifications_${followerFid.toString()}`,
      verificationAddresses,
    )
    logger.info('Verification addresses fetched and cached successfully', {
      followerFid,
      verificationAddresses,
    })
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
  let daoIds = await getCache<string[] | null>(
    `dao_ids_${followerFid.toString()}`,
    CACHE_MAX_AGE_MS,
  )

  if (daoIds) {
    logger.debug('DAO IDs fetched from cache', { followerFid, daoIds })
  } else {
    if (verificationAddresses.length > 0) {
      const daoResponse = await getDAOsForOwners(env, verificationAddresses)
      daoIds = daoResponse.daos.map((dao) => dao.id) // Extract DAO IDs only
      await setCache(`dao_ids_${followerFid.toString()}`, daoIds)
      logger.info('DAO IDs fetched and cached successfully', {
        followerFid,
        daoIds,
      })
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
  let fid = await getCache<number | null>('user_fid', CACHE_MAX_AGE_MS)

  if (fid) {
    logger.debug('User FID fetched from cache', { fid })
  } else {
    const response = await getMe(env)
    fid = response.user.fid
    await setCache('user_fid', fid)
    logger.info('User FID fetched and cached successfully', { fid })
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
    logger.info('Active proposals fetched successfully', {
      proposalsTime,
      proposals,
    })

    const fid = await getUserFid()

    const followers = await getFollowerFids(fid)

    for (const follower of followers) {
      const addresses = await getFollowerAddresses(follower)
      const daos = await getFollowerDAOs(follower, addresses)

      logger.debug('DAO IDs for follower processed', {
        followerFid: follower,
        daos,
      })
    }

    proposalsTime = nowDateTime.toUnixInteger()
    await setCache('proposals_time', proposalsTime)
    logger.info('Proposals time cached successfully', { proposalsTime })
  } catch (error) {
    if (error instanceof Error) {
      logger.error('Error executing async function', {
        message: error.message,
        stack: error.stack,
      })
    } else {
      logger.error('Unknown error occurred', { error })
    }
  }
})()
