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
import { filter, pipe } from 'remeda'
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
        voteStartTimestamp < currentUnixTimestamp &&
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
 * Handles proposals that are ending soon and sends notifications.
 */
async function handleEndingProposals() {
  try {
    logger.info('Fetching active proposals ending soon...')
    const { proposals } = await getActiveProposals()
    logger.info({ proposals }, 'Active proposals ending soon retrieved.')

    const currentUnixTimestamp = DateTime.now().toSeconds() // Current Unix timestamp in seconds
    logger.debug({ currentUnixTimestamp }, 'Current Unix timestamp calculated.')

    // Filter proposals where voting is ending soon
    const endingProposals = filter(proposals, (proposal) => {
      const voteEndTimestamp = Number(proposal.voteEnd)
      logger.debug(
        { proposalId: proposal.id, voteEndTimestamp },
        'Evaluating proposal ending time.',
      )
      return (
        voteEndTimestamp > currentUnixTimestamp &&
        voteEndTimestamp <= currentUnixTimestamp + 86400
      ) // Ending within the next day (86400 seconds)
    })

    const proposalCount = endingProposals.length
    if (proposalCount === 0) {
      logger.warn('No ending proposals found, terminating execution.')
      return
    }
    logger.info(
      { proposalCount, endingProposals },
      'Ending proposals fetched successfully',
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
      const cacheKey = `notified_ending_proposals_${follower.toString()}`
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
      for (const proposal of endingProposals) {
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
 * Handles notifications for both voting and ending proposals sequentially.
 *
 * This function triggers notifications for proposals that are currently active.
 * It ensures that notifications for voting proposals are processed first, followed
 * by ending proposals.
 */
export async function handleActiveProposals() {
  await handleVotingProposals()
  await handleEndingProposals()
}
