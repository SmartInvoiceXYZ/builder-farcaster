import { env } from '@/config'
import { logger } from '@/logger'
import { completeTask, retryTask } from '@/queue'
import { Dao, Propdate, Proposal, UpdateDao } from '@/services/builder/types'
import { sendDirectCast } from '@/services/warpcast/send-direct-cast'
import { isPast, toRelativeTime } from '@/utils'
import { PrismaClient } from '@prisma/client'
import sha256 from 'crypto-js/sha256'
import { uniqueBy } from 'remeda'

type TaskData = {
  type: 'notification' | 'test' | 'invitation'
} & (NotificationData | InvitationData)

interface NotificationData {
  recipient: number
  proposal?: Proposal
  propdate?: Propdate
  dao?: UpdateDao
}

interface InvitationData {
  recipient: number
  daos: Dao[]
}

/**
 * Formats a proposal notification message
 * @param proposal - The proposal data to format into a message
 * @returns A formatted string containing the proposal notification message
 */
function formatProposalMessage(proposal: Proposal): string {
  const {
    proposalNumber,
    title: proposalTitle,
    dao: {
      id: daoId,
      name: daoName,
      chain: { name: chainName },
    },
    timeCreated: createdAt,
    voteStart: votingStartsAt,
    voteEnd: votingEndsAt,
  } = proposal

  return (
    `📢 A new proposal (#${proposalNumber.toString()}: "${proposalTitle}") has been created on ${daoName} ` +
    `around ${toRelativeTime(Number(createdAt))}. ` +
    `🗳️ Voting ${isPast(Number(votingStartsAt)) ? 'started' : 'starts'} ${toRelativeTime(Number(votingStartsAt))} and ` +
    `${isPast(Number(votingEndsAt)) ? 'ended' : 'ends'} ${toRelativeTime(Number(votingEndsAt))}. ` +
    `🚀🚀 Check it out for more details and participate in the voting process!` +
    `\n\nhttps://nouns.build/dao/${chainName.toLowerCase()}/${daoId}/vote/${proposalNumber.toString()}`
  )
}

/**
 * Formats a proposal update (propdate) notification message
 * @param propdate - The proposal update data to format
 * @param dao - The DAO information associated with the update
 * @returns A formatted string containing the proposal update notification message
 */
function formatPropdateMessage(propdate: Propdate, dao: UpdateDao): string {
  const {
    propId: proposalNumber,
    chain: { name: chainName },
    milestoneId: milestone,
    timeCreated: createdAt,
    response,
  } = propdate
  const {
    id: daoId,
    name: daoName,
    proposals: [{ title: proposalTitle }],
  } = dao

  const truncatedUpdate =
    response.split('\n').slice(0, 2).join('\n') +
    (response.split('\n').length > 2 ? '...' : '')

  return (
    `📢 A new update to proposal (#${proposalNumber.toString()}: "${proposalTitle}") for milestone ${milestone.toString()} has been created on ${daoName} ` +
    `around ${toRelativeTime(Number(createdAt))}. ` +
    `\n\n${truncatedUpdate} ` +
    `\n\n🚀 Check it out for more details and participate in the voting process!` +
    `\n\nhttps://nouns.build/dao/${chainName}/${daoId}/vote/${proposalNumber.toString()}`
  )
}

/**
 * Handles notification tasks.
 * @param taskId - The unique identifier for the task.
 * @param data - The data associated with the notification task.
 * @returns Resolves when the notification has been successfully handled.
 */
async function handleNotification(taskId: string, data: NotificationData) {
  try {
    const { recipient, proposal, propdate, dao } = data
    let message: string | undefined
    if (proposal) {
      message = formatProposalMessage(proposal)
    } else if (propdate && dao) {
      message = formatPropdateMessage(propdate, dao)
    }
    if (!message) {
      throw new Error('No valid message format found')
    }
    const idempotencyKey = sha256(message).toString()

    const result = await sendDirectCast(env, recipient, message, idempotencyKey)

    if (!result.success) {
      throw new Error(`Non-successful result: ${JSON.stringify(result)}`)
    }

    logger.info({ recipient, result }, 'Direct cast sent successfully.')
  } catch (error) {
    if (error instanceof Error) {
      logger.error(
        { message: error.message, stack: error.stack },
        'Failed to send notification',
      )
    } else {
      logger.error({ error }, 'Unknown error occurred')
    }

    await retryTask(taskId)
  }
}

/**
 * Handles invitation tasks.
 * @param taskId - The unique identifier for the task.
 * @param data - The data associated with the invitation task.
 * @returns Resolves when the invitation has been successfully handled.
 */
async function handleInvitation(taskId: string, data: InvitationData) {
  try {
    const { recipient, daos } = data
    const uniqueDaos = uniqueBy(daos, (dao) => dao.name)

    const daoNames = uniqueDaos
      .map((dao) => dao.name.replace(/\s*(?:DAO|dao)$/, '')) // Clean names inline
      .join(', ')
    const daoCount = uniqueDaos.length.toString()

    const message =
      uniqueDaos.length === 1
        ? `👋 Hey there! You're a proud member of ${daoNames}, powered by Builder Protocol. 🎉 ` +
          `Want to stay in the loop for the latest proposals? Follow @builderbot on Warpcast ` +
          `to never miss an update! 🚀`
        : `👋 Hey there! You're a member of ${daoCount} DAOs built by Builder Protocol: ${daoNames}. 🚀 ` +
          `Stay informed about new proposals in your DAOs by following @builderbot on Warpcast ` +
          `and make your voice count! 🎉`

    const idempotencyKey = sha256(message).toString()
    const result = await sendDirectCast(env, recipient, message, idempotencyKey)

    if (!result.success) {
      throw new Error(`Non-successful result: ${JSON.stringify(result)}`)
    }

    logger.info({ recipient, result }, 'Invitation sent successfully.')
  } catch (error) {
    if (error instanceof Error) {
      logger.error(
        { message: error.message, stack: error.stack },
        'Failed to send invitation',
      )
    } else {
      logger.error({ error }, 'Unknown error occurred')
    }

    await retryTask(taskId)
  }
}

/**
 * Processes a queue of tasks from the database with an optional limit on the number of tasks to process at one time.
 *
 * This function retrieves pending tasks from the database, processes each task by its type, and marks them as completed.
 * If there are no pending tasks, it waits for a short period before checking again.
 * @param [limit] - Optional limit on the number of tasks to take from the queue.
 * @returns A promise that resolves when the queue processing is done.
 */
export const queueConsumeCommand = async (limit?: number) => {
  try {
    const prisma = new PrismaClient()

    const tasks = await prisma.queue.findMany({
      where: { status: 'pending' },
      orderBy: { timestamp: 'asc' },
      take: limit,
    })

    if (tasks.length <= 0) {
      logger.warn('No pending tasks available. Waiting...')
      return
    }

    for (const task of tasks) {
      logger.info({ taskId: task.taskId }, 'Processing task')

      const taskData = JSON.parse(task.data) as TaskData

      switch (taskData.type) {
        case 'notification':
          await handleNotification(task.taskId, taskData as NotificationData)
          break
        case 'invitation':
          await handleInvitation(task.taskId, taskData as InvitationData)
          break
        default:
          logger.error({ task }, 'Unknown task type')
          break
      }

      await completeTask(task.taskId)
      logger.info({ taskId: task.taskId }, 'Task marked as completed')
    }
  } catch (error) {
    logger.error({ error }, 'Error while processing the queue')
  }
}
