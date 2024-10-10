import { env } from '@/config'
import { logger } from '@/logger'
import { completeTask, retryTask } from '@/queue'
import { sendDirectCast } from '@/services/warpcast/send-direct-cast'
import { isPast, toRelativeTime } from '@/utils'
import { PrismaClient } from '@prisma/client'
import sha256 from 'crypto-js/sha256'

type TaskData = {
  type: 'notification' | 'test'
} & NotificationData

interface NotificationData {
  recipient: number
  proposal: {
    id: string
    proposalNumber: number
    dao: {
      id: string
      name: string
    }
    title: string
    proposer: string
    timeCreated: string
    voteStart: string
    voteEnd: string
  }
}

/**
 * Handles notification tasks.
 * @param taskId - The unique identifier for the task.
 * @param data - The data associated with the notification task.
 * @returns Resolves when the notification has been successfully handled.
 */
async function handleNotification(taskId: string, data: NotificationData) {
  try {
    const { recipient, proposal } = data
    const proposalNumber = proposal.proposalNumber.toString()
    const proposalTitle = proposal.title
    const daoName = proposal.dao.name
    const createdAt = Number(proposal.timeCreated)
    const votingStartsAt = Number(proposal.voteStart)
    const votingEndsAt = Number(proposal.voteEnd)

    const message =
      `A new proposal (#${proposalNumber}: "${proposalTitle}") has been created on ${daoName} ` +
      `around ${toRelativeTime(createdAt)}. ` +
      `Voting ${isPast(votingStartsAt) ? 'started' : 'starts'} ${toRelativeTime(votingStartsAt)} and ` +
      `${isPast(votingEndsAt) ? 'ended' : 'ends'} ${toRelativeTime(votingEndsAt)}. ` +
      `Check it out for more details and participate in the voting process!`
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

export const consumeQueue = async (limit?: number) => {
  try {
    const prisma = new PrismaClient()

    const tasks = await prisma.queue.findMany({
      where: { status: 'pending' },
      orderBy: { timestamp: 'asc' },
      take: limit,
    })

    if (tasks.length > 0) {
      for (const task of tasks) {
        logger.info({ taskId: task.taskId }, 'Processing task')

        const taskData = JSON.parse(task.data) as TaskData

        switch (taskData.type) {
          case 'notification':
            await handleNotification(task.taskId, taskData as NotificationData)
            break
          default:
            logger.error({ task }, 'Unknown task type')
            break
        }

        await completeTask(task.taskId)
        logger.info({ taskId: task.taskId }, 'Task marked as completed')
      }
    } else {
      logger.info('No pending tasks available. Waiting...')
      await new Promise((resolve) => setTimeout(resolve, 5000))
    }
  } catch (error) {
    logger.error({ error }, 'Error while processing the queue')
  }
}
