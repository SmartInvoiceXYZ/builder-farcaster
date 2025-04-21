import { chainEndpoints } from '@/services/builder/index'
import { Chain, Proposal } from '@/services/builder/types'
import { gql, GraphQLClient } from 'graphql-request'
import { JsonObject } from 'type-fest'

type Data = {
  proposal: Proposal
} & JsonObject

interface Result {
  proposal: Proposal
}

export const getProposalData = async (
  chain: Chain,
  proposalId: string,
): Promise<Result> => {
  const query = gql`
    {
      proposal(
        id: "${proposalId}"
      ) {
        proposalNumber
        title
        dao{
          id
          name
        }
      }
    }
  `

  try {
    const endpoint = chainEndpoints.find(
      (endPoint) => endPoint.chain.id === chain.id,
    )
    if (!endpoint) {
      throw new Error(`Endpoint not found for chain ID: ${chain.id.toString()}`)
    }
    const client = new GraphQLClient(endpoint.endpoint)
    const response = await client.request<Data>(query)
    if (!response.proposal.title) {
      throw new Error(`Proposal does not exist: ${proposalId}`)
    }
    return { proposal: response.proposal }
  } catch (error) {
    console.error('Error fetching proposal data for proposal update:', error)
    throw error
  }
}
