// Constants
import { getCache, setCache } from '@/cache'
import {
  getFollowerAddresses,
  getFollowerDAOs,
  getFollowerFids,
  getUserFid,
} from '@/handlers/index'
import { logger } from '@/logger'
import { addToQueue } from '@/queue'
import { getActiveProposals } from '@/services/builder/get-active-proposals'
import { DateTime } from 'luxon'
import { filter, map, pipe } from 'remeda'
import { JsonValue } from 'type-fest'

/**
 * Handles proposals that are pending for voting and sends notifications.
 */
async function handleVotingProposals() {
  try {
    logger.info('Fetching active proposals...')
    const { proposals } = await getActiveProposals()
    logger.info({ proposals }, 'Active proposals retrieved.')

    const currentUnixTimestamp = DateTime.now().toSeconds() // Current Unix timestamp in seconds
    logger.debug({ currentUnixTimestamp }, 'Current Unix timestamp calculated.')

    // Filter proposals where voting has not started yet
    const votingProposals = filter(proposals, (proposal) => {
      const voteStartTimestamp = Number(proposal.voteStart)
      const voteEndTimestamp = Number(proposal.voteEnd)
      logger.debug(
        { proposalId: proposal.id, voteStartTimestamp, voteEndTimestamp },
        'Evaluating proposal voting time.',
      )
      return (
        voteStartTimestamp > currentUnixTimestamp &&
        voteEndTimestamp > currentUnixTimestamp
      )
    })

    const proposalCount = votingProposals.length
    if (proposalCount === 0) {
      logger.warn('No active proposals found, terminating execution.')
      return
    }
    logger.info(
      { proposalCount, votingProposals },
      'Active proposals fetched successfully',
    )

    const userFid = await getUserFid()
    logger.debug({ userFid }, 'User FID retrieved.')
    const followers = await getFollowerFids(userFid)
    logger.info({ followerCount: followers.length }, 'Follower FIDs retrieved.')

    for (const follower of followers) {
      logger.debug({ follower }, 'Processing follower.')
      // Retrieve the ethereum addresses associated with the current follower
      let addresses = await getFollowerAddresses(follower)
      logger.debug({ follower, addresses }, 'Follower addresses retrieved.')

      addresses = pipe(
        addresses,
        filter((address) => /^0x[a-fA-F0-9]{40}$/.test(address)),
      )
      logger.debug(
        { follower, addresses },
        'Filtered valid Ethereum addresses.',
      )

      // If no addresses are found, skip to the next follower
      if (addresses.length === 0) {
        logger.info(
          { follower },
          'No valid addresses found for follower, skipping.',
        )
        continue
      }

      // Retrieve the DAOs associated with the current follower and their addresses
      const daos = await getFollowerDAOs(follower, addresses)
      logger.debug(
        { follower, daos },
        'DAOs associated with follower retrieved.',
      )

      // If no DAOs are found, skip to the next follower
      if (!daos || daos.length <= 0) {
        logger.info({ follower }, 'No DAOs found for follower, skipping.')
        continue
      }

      // Retrieve notified proposals from cache
      const cacheKey = `notified_voting_proposals_${follower.toString()}`
      logger.debug({ cacheKey }, 'Retrieving notified proposals from cache.')
      let notifiedProposals = await getCache<string[]>(cacheKey)
      if (!notifiedProposals) {
        logger.info(
          { follower },
          'No notified proposals found in cache, initializing new set.',
        )
        notifiedProposals = []
      } else {
        logger.debug(
          { follower, notifiedProposals },
          'Notified proposals retrieved from cache.',
        )
      }

      // Convert notifiedProposals to a Set for efficient lookups
      const notifiedProposalsSet = new Set(notifiedProposals)

      // Loop through each proposal in the filtered proposals array
      for (const proposal of votingProposals) {
        logger.debug(
          { proposalId: proposal.id },
          'Processing proposal for follower.',
        )
        // If the proposal's DAO ID is not in the list of DAOs for the current follower, skip to the next proposal
        if (!daos.includes(proposal.dao.id)) {
          logger.debug(
            { proposalId: proposal.id, follower },
            'Proposal DAO ID not associated with follower, skipping.',
          )
          continue
        }

        // Check if this proposal has already been notified
        if (notifiedProposalsSet.has(proposal.id)) {
          logger.debug(
            { proposalId: proposal.id, follower },
            'Proposal already notified, skipping.',
          )
          continue
        }

        // Add the proposal to the queue for notifications
        logger.info(
          { proposalId: proposal.id, follower },
          'Adding proposal to notification queue.',
        )
        await addToQueue({
          type: 'notification',
          recipient: follower,
          proposal: proposal as unknown as JsonValue,
        })

        // Mark this proposal as notified
        notifiedProposalsSet.add(proposal.id)
        logger.debug(
          { proposalId: proposal.id, follower },
          'Proposal marked as notified.',
        )
      }

      // Update the cache with the new set of notified proposals
      logger.debug(
        { cacheKey, notifiedProposals: Array.from(notifiedProposalsSet) },
        'Updating cache with notified proposals.',
      )
      await setCache(cacheKey, Array.from(notifiedProposalsSet))
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
}

/**
 *
 */
async function handleEndingProposals() {
  const nowDateTime = DateTime.now()
  try {
    // Fetch proposals ending within one day from the last recorded proposalsTime
    const { proposals } = await getActiveProposals()
    logger.info({ proposals }, 'Ending proposals fetched successfully')

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
  // await Promise.all([
  await handleVotingProposals()
  // handleEndingProposals()
  // ])
}
