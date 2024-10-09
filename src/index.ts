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
  const cacheKey = `followers_fids_${fid.toString()}`
  let followers = await getCache<number[] | null>(cacheKey, CACHE_MAX_AGE_MS)

  if (followers) {
    logger.debug({ fid, followers }, 'Follower FIDs fetched from cache')
  } else {
    const { users } = await getFollowers(env, fid)
    followers = users.map((user) => user.fid) // Extract FIDs only
    await setCache(cacheKey, followers)
    logger.info(
      { fid, followers },
      'Follower FIDs fetched and cached successfully',
    )
  }
  return followers
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
    const { verifications } = await getVerifications(env, follower)
    addresses = verifications.map((verification) =>
      verification.address.toLowerCase(),
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
      const { daos } = await getDAOsForOwners(env, addresses)
      daoIds = daos.map((dao) => dao.id.toLowerCase()) // Extract DAO IDs only
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
    const { user } = await getMe(env)
    fid = user.fid
    await setCache(cacheKey, fid)
    logger.info({ fid }, 'User FID fetched and cached successfully')
  }
  return fid
}

/**
 * Handles the active proposals by fetching, processing, and updating necessary information.
 * The method performs the following steps:
 * 1. Fetches the current date and time.
 * 2. Retrieves the last proposals fetch time from the cache.
 * 3. Fetches the active proposals from an external source.
 * 4. Processes each follower to intersect their DAOs with active proposals.
 * 5. Updates the proposals fetch time in the cache.
 * @returns A promise that resolves when the process is complete.
 */
async function handleActiveProposals() {
  try {
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

    if (proposals.length === 0) {
      logger.warn('No active proposals found, terminating execution.')
      return
    }

    const followers = await getFollowerFids(await getUserFid())
    for (const follower of followers) {
      // Retrieve the addresses associated with the current follower
      const addresses = await getFollowerAddresses(follower)

      // If no addresses are found, skip to the next follower
      if (addresses.length === 0) {
        continue
      }

      // Retrieve the DAOs associated with the current follower and their addresses
      const daos = await getFollowerDAOs(follower, addresses)

      // If no DAOs are found, skip to the next follower
      if (!daos || daos.length <= 0) {
        continue
      }

      // Loop through each proposal in the proposals array
      for (const proposal of proposals) {
        // If the proposal's DAO ID is not in the list of DAOs for the current follower, skip to the next proposal
        if (!daos.includes(proposal.dao.id)) {
          continue
        }

        logger.info(
          {
            proposalNumber: proposal.proposalNumber,
            title: proposal.title,
            daoName: proposal.dao.name,
          },
          `Proposal ${proposal.proposalNumber.toString()} - ${proposal.title} for ${proposal.dao.name}`,
        )
      }
    }

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
}

// Handling some application logic with caching
void (async () => {
  await handleActiveProposals()
})()
