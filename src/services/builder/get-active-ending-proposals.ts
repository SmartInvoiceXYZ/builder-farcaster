import { Env, Proposal } from '@/services/builder/types'
import { gql, GraphQLClient } from 'graphql-request'
import { flatMap, pipe, uniqueBy } from 'remeda'
import { JsonObject } from 'type-fest'

type Data = {
  proposals: Proposal[]
} & JsonObject

interface Result {
  proposals: Proposal[]
}

export const getActiveEndingProposals = async (
  env: Env,
  time: number,
): Promise<Result> => {
  const query = gql`
    {
      proposals(
        skip: 0
        first: 100
        orderBy: voteEnd
        orderDirection: asc
        where: {
          voteEnd_gte: ${time}
          voteEnd_lte: ${time + 86400}
          queued: false
          executed: false
          canceled: false
          vetoed: false
        }
      ) {
        id
        proposalNumber
        dao {
          id
          name
        }
        title
        proposer
        timeCreated
        voteStart
        voteEnd
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
    const proposalsPromises = endpoints.map(async (endpoint) => {
      const client = new GraphQLClient(endpoint)
      const response = await client.request<Data>(query)
      return response.proposals
    })

    const results = await Promise.all(proposalsPromises)
    const uniqueProposals = pipe(
      results,
      flatMap((proposals) => proposals),
      uniqueBy((proposal) => proposal.id),
    )
    return { proposals: uniqueProposals }
  } catch (error) {
    console.error('Error fetching active proposals:', error)
    throw error
  }
}
