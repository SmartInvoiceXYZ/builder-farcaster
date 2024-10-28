import { Env, Owner } from '@/services/builder/types'
import { gql, GraphQLClient } from 'graphql-request'
import { flatMap, pipe } from 'remeda'
import { JsonObject } from 'type-fest'

type Data = {
  owners: Owner[]
} & JsonObject

interface Result {
  owners: Owner[]
}

export const getDAOsTokenOwners = async (
  env: Env,
  skip = 0,
  first = 10,
): Promise<Result> => {
  let allOwners: Owner[] = []
  let currentSkip = skip || 0
  let hasMore: boolean

  const query = gql`
    {
      owners: daotokenOwners(
        skip: ${currentSkip}
        first: ${first}
        orderBy: daoTokenCount
        orderDirection: desc
        where: {}
        subgraphError: deny
      ) {
        id
        owner
        dao {
          id
          name
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
    do {
      const responses = await Promise.all(
        endpoints.map(async (endpoint) => {
          const client = new GraphQLClient(endpoint)
          const response = await client.request<Data>(query)
          return response.owners
        }),
      )

      const combinedResults = pipe(
        responses,
        flatMap((result) => result),
      )

      allOwners = [...allOwners, ...combinedResults]
      hasMore = allOwners.length > 0

      if (hasMore) {
        currentSkip += combinedResults.length
      }
    } while (hasMore)

    return { owners: allOwners }
  } catch (error) {
    console.error('Error fetching DAO token owners across chains:', error)
    throw error
  }
}
