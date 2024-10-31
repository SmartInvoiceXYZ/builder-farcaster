import { chainEndpoints } from '@/services/builder/index'
import { Proposal } from '@/services/builder/types'
import { gql, GraphQLClient } from 'graphql-request'
import { flatMap, pipe, uniqueBy } from 'remeda'
import { JsonObject } from 'type-fest'

type Data = {
  proposals: Proposal[]
} & JsonObject

interface Result {
  proposals: Proposal[]
}

export const getActiveProposals = async (): Promise<Result> => {
  const query = gql`
    {
      proposals(
        skip: 0
        first: 100
        orderBy: timeCreated
        orderDirection: asc
        where: {
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

  try {
    const proposalsPromises = chainEndpoints.map(
      async ({ chain, endpoint }) => {
        const client = new GraphQLClient(endpoint)
        const response = await client.request<Data>(query)
        return response.proposals.map((proposal) => ({
          ...proposal,
          dao: {
            ...proposal.dao,
            chain,
          },
        }))
      },
    )

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
