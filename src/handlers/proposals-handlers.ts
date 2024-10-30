// Constants
import { getCache, setCache } from '@/cache'
import { env } from '@/config'
import {
  getFollowerAddresses,
  getFollowerDAOs,
  getFollowerFids,
  getUserFid,
} from '@/handlers/index'
import { logger } from '@/logger'
import { addToQueue } from '@/queue'
import { getActiveEndingProposals } from '@/services/builder/get-active-ending-proposals'
import { getActiveVotingProposals } from '@/services/builder/get-active-voting-proposals'
import { DateTime } from 'luxon'
import { filter, last, map, pipe } from 'remeda'
import { JsonValue } from 'type-fest'

/**
 * Handles the notifications related to active voting proposals.
 *
 * This method does the following:
 * - Fetches the current date and time.
 * - Retrieves the cached time for proposal votes or sets a default time.
 * - Fetches active voting proposals based on the proposals time.
 * - Logs the fetched active proposals.
 * - Retrieves followers and their associated Ethereum addresses.
 * - Retrieves DAOs associated with followers and their addresses.
 * - Adds proposals to the notification queue for followers interested in the specific DAOs.
 * - Updates the cache with the latest proposal vote time.
 * - Handles and logs errors that occur during the process.
 * @returns A promise that resolves when the notification handling is complete.
 */
async function handleVotingProposals() {
  try {
    const nowDateTime = DateTime.now()
    const timeCacheKey = 'proposals_vote_time'
    let proposalsTime =
      (await getCache<number | null>(timeCacheKey)) ??
      nowDateTime.minus({ days: 3 }).toUnixInteger()

    const { proposals } = await getActiveVotingProposals(env, proposalsTime)
    logger.info(
      { proposalsTime, proposals },
      'Active proposals fetched successfully',
    )

    if (proposals.length === 0) {
      logger.warn('No active voting proposals found, terminating execution.')
      return
    }

    const followers = await getFollowerFids(await getUserFid())
    for (const follower of followers) {
      // Retrieve the ethereum addresses associated with the current follower
      let addresses = await getFollowerAddresses(follower)
      addresses = pipe(
        addresses,
        filter((address) => /^0x[a-fA-F0-9]{40}$/.test(address)),
      )

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

        // Add the proposal to the queue for notifications
        await addToQueue({
          type: 'notification',
          recipient: follower,
          proposal: proposal as unknown as JsonValue,
        })
      }
    }

    const proposalVoteStart = last(proposals)?.voteStart
    proposalsTime = proposalVoteStart
      ? Number(proposalVoteStart)
      : nowDateTime.toUnixInteger()
    await setCache(timeCacheKey, proposalsTime)
    logger.info({ proposalsTime }, 'Proposals vote time cached successfully')
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

/**
 * Handles notifications for ending proposals.
 *
 * This method fetches proposals that are nearing their end and notifies followers
 * who are associated with the DAOs of these proposals. It fetches the proposals ending
 * within one day, retrieves the followers and their associated Ethereum addresses,
 * and then sends notifications to those followers for proposals that match their DAOs.
 *
 * Caches the most recent time when proposals were retrieved and updates this cache upon
 * successful processing.
 * @returns A promise that resolves when the method has completed execution.
 */
async function handleEndingProposals() {
  try {
    const nowDateTime = DateTime.now()
    logger.debug({ nowDateTime }, 'Current date and time retrieved')
    const timeCacheKey = 'proposals_end_time'
    let proposalsTime =
      (await getCache<number | null>(timeCacheKey)) ??
      nowDateTime.minus({ days: 1 }).toUnixInteger()
    logger.debug(
      { proposalsTime },
      'Proposals time retrieved from cache or set to default',
    )

    // Fetch proposals ending within one day from the last recorded proposalsTime
    const { proposals } = await getActiveEndingProposals(env, proposalsTime)
    logger.info(
      { proposalsTime, proposals },
      'Ending proposals fetched successfully',
    )

    if (proposals.length === 0) {
      logger.warn('No active ending proposals found, terminating execution.')
      return
    }

    // Retrieve all followers once (assuming there's a shared user fid cacheable by getUserFid)
    const followers = await getFollowerFids(await getUserFid())
    logger.debug(
      { followersCount: followers.length },
      'Followers retrieved successfully',
    )

    const notifiedProposalsCacheKey = 'notified_proposals_map'
    let notifiedProposalsMap = new Map<
      string,
      { followers: Set<number>; voteEnd: number }
    >(
      pipe(
        (await getCache<
          [string, { followers: number[]; voteEnd: number }][] | null
        >(notifiedProposalsCacheKey)) ?? [],
        map(([proposalId, { followers, voteEnd }]) => [
          proposalId,
          { followers: new Set(followers), voteEnd },
        ]),
      ) as Iterable<[string, { followers: Set<number>; voteEnd: number }]>,
    )
    logger.debug(
      { notifiedProposalsMapSize: notifiedProposalsMap.size },
      'Notified proposals map retrieved from cache',
    )

    // Cleanup outdated proposals from the map
    const nowTime = nowDateTime.toUnixInteger()
    notifiedProposalsMap = new Map(
      pipe(
        Array.from(notifiedProposalsMap.entries()),
        filter(([, { voteEnd }]) => voteEnd > nowTime),
      ),
    )
    logger.debug(
      { notifiedProposalsMapSize: notifiedProposalsMap.size },
      'Outdated proposals cleaned from the map',
    )

    for (const follower of followers) {
      logger.debug({ follower }, 'Processing follower')
      // Retrieve the ethereum addresses associated with the current follower
      let addresses = await getFollowerAddresses(follower)
      addresses = pipe(
        addresses,
        filter((address) => /^0x[a-fA-F0-9]{40}$/.test(address)),
      )
      logger.debug(
        { follower, addressesCount: addresses.length },
        'Addresses retrieved and filtered',
      )

      // If no addresses are found, skip to the next follower
      if (addresses.length === 0) {
        logger.debug({ follower }, 'No addresses found, skipping follower')
        continue
      }

      // Retrieve the DAOs associated with the current follower and their addresses
      const daos = await getFollowerDAOs(follower, addresses)
      if (daos) {
        logger.debug(
          { follower, daosCount: daos.length },
          'DAOs retrieved for follower',
        )
      }

      // If no DAOs are found, skip to the next follower
      if (!daos || daos.length <= 0) {
        logger.debug({ follower }, 'No DAOs found, skipping follower')
        continue
      }

      // Loop through each proposal in the proposals array
      for (const proposal of proposals) {
        logger.debug(
          { proposalId: proposal.id, follower },
          'Processing proposal for follower',
        )
        // Get or initialize the set of notified followers for this proposal
        if (!notifiedProposalsMap.has(proposal.id)) {
          notifiedProposalsMap.set(proposal.id, {
            followers: new Set<number>(),
            voteEnd: Number(proposal.voteEnd),
          })
          logger.debug(
            { proposalId: proposal.id },
            'Initialized notified followers set for proposal',
          )
        }
        const notifiedFollowers =
          notifiedProposalsMap.get(proposal.id)?.followers ?? new Set<number>()

        // If we've already sent a notification to this follower about this proposal, skip it
        if (notifiedFollowers.has(follower)) {
          logger.debug(
            { proposalId: proposal.id, follower },
            'Follower already notified for this proposal, skipping',
          )
          continue
        }

        // If the proposal's DAO ID is not in the list of DAOs for the current follower, skip to the next proposal
        if (!daos.includes(proposal.dao.id)) {
          logger.debug(
            { proposalId: proposal.id, follower },
            'Proposal DAO ID not in follower DAOs, skipping proposal',
          )
          continue
        }

        // Add the proposal to the queue for notifications and mark the follower as notified
        await addToQueue({
          type: 'notification',
          recipient: follower,
          proposal: proposal as unknown as JsonValue,
        })
        logger.info(
          { proposalId: proposal.id, follower },
          'Notification added to queue for follower and proposal',
        )
        notifiedFollowers.add(follower)
      }
    }

    // Update the cache for notified proposals map
    await setCache(
      notifiedProposalsCacheKey,
      pipe(
        Array.from(notifiedProposalsMap.entries()),
        map(([proposalId, { followers, voteEnd }]) => [
          proposalId,
          { followers: Array.from(followers), voteEnd },
        ]),
      ),
    )
    logger.debug('Notified proposals map cache updated successfully')

    proposalsTime = nowDateTime.toUnixInteger()
    await setCache(timeCacheKey, proposalsTime)
    logger.info({ proposalsTime }, 'Proposals end time cached successfully')
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

/**
 * Handles notifications for both voting and ending proposals concurrently.
 *
 * This function triggers notifications for proposals that are currently active.
 * It ensures that notifications for voting proposals and ending proposals are
 * processed at the same time using `Promise.all`.
 * @returns A promise that resolves when all notifications have been handled.
 */
export async function handleActiveProposals() {
  await Promise.all([handleVotingProposals(), handleEndingProposals()])
}
