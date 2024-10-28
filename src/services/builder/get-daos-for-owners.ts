import { Dao, Env, Owner } from '@/services/builder/types'
import { gql, GraphQLClient } from 'graphql-request'
import { flatMap, pipe, uniqueBy } from 'remeda'
import { JsonObject } from 'type-fest'

type Data = {
  owners: Owner[]
} & JsonObject

interface Result {
  daos: Dao[]
}

export const getDAOsForOwners = async (
  env: Env,
  ownerAddresses: string[],
): Promise<Result> => {
  const query = gql`
    {
      owners: daotokenOwners(
        skip: 0
        first: 1000
        where: { owner_in: ${JSON.stringify(ownerAddresses)} }
      ) {
        id
        owner
        dao {
          id
          name
          ownerCount
        }
        daoTokenCount
      }
    }
  `

  const endpoints = [
    env.BUILDER_SUBGRAPH_ETHEREUM_URL,
    env.BUILDER_SUBGRAPH_BASE_URL,
    env.BUILDER_SUBGRAPH_OPTIMISM_URL,
    env.BUILDER_SUBGRAPH_ZORA_URL,
  ]

  try {
    const daoPromises = endpoints.map(async (endpoint) => {
      const client = new GraphQLClient(endpoint)
      const response = await client.request<Data>(query)
      return response.owners.map((owner) => owner.dao)
    })

    const results = await Promise.all(daoPromises)
    const uniqueDaos = pipe(
      results,
      flatMap((daos) => daos),
      uniqueBy((dao) => dao.id),
    )
    return { daos: uniqueDaos }
  } catch (error) {
    console.error('Error fetching DAO token owners:', error)
    throw error
  }
}
