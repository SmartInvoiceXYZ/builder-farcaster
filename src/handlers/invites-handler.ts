import { getCache, setCache } from '@/cache'
import { env } from '@/config'
import { CACHE_MAX_AGE_MS } from '@/handlers/index'
import { logger } from '@/logger'
import { getDAOsTokenOwners } from '@/services/builder/get-daos-token-owners'
import type { Dao, Owner } from '@/services/builder/types'
import { getUserByVerification } from '@/services/warpcast/get-user-by-verification'
import {
  concat,
  entries,
  fromEntries,
  groupBy,
  keys,
  map,
  mapValues,
  pipe,
  sort,
  unique,
} from 'remeda'

/**
 * Handles invitations by fetching DAO owners, mapping them to their respective
 * FIDs, and creating an owner-to-DAO mapping.
 */
export async function handleInvites() {
  try {
    const sortedFidToDaoMap = await getSortedFidToDaoMap()
    logger.debug(
      {
        sortedFidToDaoMap,
        sortedFidToDaoSize: keys(sortedFidToDaoMap).length,
      },
      'Sorted fidToDaoMap',
    )
  } catch (error) {
    logger.error(
      {
        message:
          error instanceof Error ? error.message : 'Unknown error occurred',
        stack: error instanceof Error ? error.stack : undefined,
      },
      'Error executing async function',
    )
  }
}

/**
 * Retrieves a sorted map of FIDs (Federated Identifiers) to DAOs (Decentralized Autonomous Organizations).
 * This method fetches DAOs token owners, groups them by owner address, maps FIDs to DAOs,
 * and finally sorts the map by the number of DAOs associated with each FID.
 * @returns A promise that resolves to an object where the keys are FIDs and the values are arrays of DAOs, sorted by the number of DAOs.
 */
async function getSortedFidToDaoMap() {
  const cacheKey = 'sorted_fid_to_dao_map'
  let sortedFidToDaoMap = await getCache<Record<number, Dao[]> | null>(
    cacheKey,
    CACHE_MAX_AGE_MS,
  )

  if (sortedFidToDaoMap) {
    logger.debug('Sorted FID to DAO map fetched from cache')
  } else {
    logger.info('Fetching DAOs token owners')
    const { owners } = await getDAOsTokenOwners(env)
    logger.debug({ owners }, 'Fetched owners')

    logger.info('Grouping owners by owner address')
    const ownerToDaosMap = groupOwnersByOwnerAddress(owners)
    logger.debug({ ownerToDaosMap }, 'Grouped owners into ownerToDaosMap')

    logger.info('Fetching FIDs for each owner and mapping DAOs')
    const fidToDaoMap = await mapFIDsToDAOs(ownerToDaosMap)

    logger.info('Sorting fidToDaoMap by the number of DAOs')
    sortedFidToDaoMap = sortFidToDaoMap(fidToDaoMap)

    await setCache(cacheKey, sortedFidToDaoMap)
    logger.info('Sorted FID to DAO map fetched and cached successfully')
  }

  return sortedFidToDaoMap
}

/**
 * Groups an array of owners by their owner address and maps each owner to a new format.
 * @param owners - The list of owners to be grouped. Each owner should have an `owner` field and a `dao` object with `id` and `name` properties.
 * @returns An object where each key is an owner address and the value is an array of Daos associated with that owner.
 */
function groupOwnersByOwnerAddress(owners: Owner[]) {
  return pipe(
    owners,
    groupBy((owner) => owner.owner),
    mapValues((owners) =>
      map(
        owners,
        (owner) =>
          ({
            id: owner.dao.id,
            name: owner.dao.name,
            ownerCount: owner.dao.ownerCount,
          }) as Dao,
      ),
    ),
  )
}

/**
 * Maps owner addresses to DAOs and retrieves their respective FIDs.
 * Updates a map of FIDs to DAOs by ensuring no duplicates.
 * @param ownerToDaosMap - A record mapping owner addresses to arrays of DAOs.
 * @returns A map of FIDs to their corresponding DAOs.
 */
async function mapFIDsToDAOs(ownerToDaosMap: Record<string, Dao[]>) {
  const fidToDaoMap: Record<number, Dao[]> = {}
  for (const [owner, daos] of entries(ownerToDaosMap)) {
    try {
      const fid = await fetchFIDForOwner(owner)
      if (fid) {
        fidToDaoMap[fid] = pipe(fidToDaoMap[fid] ?? [], concat(daos), unique())
        logger.debug({ fid, daos }, 'Updated fidToDaoMap with new DAOs')
      }
    } catch (error) {
      if (
        !(
          error instanceof Error &&
          error.message.startsWith('No FID has connected')
        )
      ) {
        logger.error({ error }, 'Error fetching Farcaster user.')
      }
    }
  }
  return fidToDaoMap
}

/**
 * Fetches the FID (Federation Identifier) associated with the specified owner.
 * @param owner - The owner identifier for which to fetch the FID.
 * @returns A promise that resolves to the fetched FID.
 */
async function fetchFIDForOwner(owner: string) {
  logger.debug({ owner }, 'Fetching FID for owner')
  const {
    user: { fid },
  } = await getUserByVerification(env, owner)
  logger.debug({ fid, owner }, 'Fetched FID for owner')
  return fid
}

/**
 * Sorts the given map of FID to DAO arrays by the length of the DAO arrays.
 * @param fidToDaoMap - A map where keys are numerical FIDs and values are arrays of DAO objects.
 * @returns A new map where the key-value pairs are sorted by the length of the DAO arrays.
 */
function sortFidToDaoMap(fidToDaoMap: Record<number, Dao[]>) {
  return pipe(
    fidToDaoMap,
    entries<Record<number, Dao[]>>,
    sort(([, daosA], [, daosB]) => daosA.length - daosB.length),
    (sortedEntries) =>
      fromEntries(sortedEntries.map(([key, value]) => [Number(key), value])),
  ) as Record<number, Dao[]>
}
