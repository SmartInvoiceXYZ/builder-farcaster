import { env } from '@/config'
import { logger } from '@/logger'
import { getDAOsTokenOwners } from '@/services/builder/get-daos-token-owners'

/**
 *
 */
export async function handleInvites() {
  try {
    const { owners } = await getDAOsTokenOwners(env)

    logger.debug({ owners })
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
