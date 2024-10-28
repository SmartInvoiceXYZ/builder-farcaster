import { env } from '@/config'
import { logger } from '@/logger'
import { getDAOsTokenOwners } from '@/services/builder/get-daos-token-owners'
import type { Dao } from '@/services/builder/types'
import { getUserByVerification } from '@/services/warpcast/get-user-by-verification'
import { entries, groupBy, map, mapValues, pipe, sort } from 'remeda'

/**
 *
 */
export async function handleInvites() {
  try {
    const { owners } = await getDAOsTokenOwners(env)

    const ownerToDaosMap = pipe(
      owners,
      groupBy((owner) => owner.owner),
      mapValues((owners) =>
        map(owners, (owner) => ({ id: owner.dao.id, name: owner.dao.name })),
      ),
      entries,
      sort((entryA, entryB) => {
        const [, daosA] = entryA as [string, Dao[]]
        const [, daosB] = entryB as [string, Dao[]]
        return daosA.length - daosB.length
      }),
      map((entry) => {
        const [owner, daos] = entry as [string, Dao[]]
        return { owner, daos }
      }),
    )

    const fidToDaoMap: Record<number, Dao[]> = {}

    for (const { owner, daos } of ownerToDaosMap) {
      try {
        const {
          user: { fid },
        } = await getUserByVerification(env, owner)
        if (fid) {
          fidToDaoMap[fid] = [...new Set([...fidToDaoMap[fid], ...daos])]
        }
      } catch (error) {
        if (
          error instanceof Error &&
          !error.message.startsWith('No FID has connected')
        ) {
          logger.error({ error }, 'Error fetching Farcaster user.')
        }
      }
    }

    logger.debug({ fidToDaoMap })
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
