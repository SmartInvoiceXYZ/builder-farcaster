import { chainEndpoints } from '@/services/builder/index'
import { Chain, UpdateDao } from '@/services/builder/types'
import { gql, GraphQLClient } from 'graphql-request'
import { JsonObject } from 'type-fest'

type Data = {
  daos: UpdateDao[]
} & JsonObject

interface Result {
  dao: UpdateDao
}

export const getDAOForTreasuryAddress = async (
  chain: Chain,
  treasuryAddress: string,
  proposalNumber: number,
): Promise<Result> => {
  const query = gql`
    {
      daos(
        first: 1
        where: { treasuryAddress: "${treasuryAddress.toLowerCase()}" }
      ) {
        id
        name
        proposals(        
          first: 1
          where: { proposalNumber: ${proposalNumber} }
          ) {
          title
        }
      }
    }
  `

  try {
    const endpoint = chainEndpoints.find(
      (endPoint) => endPoint.chain.id === chain.id,
    )
    console.log(endpoint)
    if (!endpoint) {
      throw new Error(`Endpoint not found for chain ID: ${chain.id.toString()}`)
    }
    const client = new GraphQLClient(endpoint.endpoint)
    const response = await client.request<Data>(query)
    if (response.daos.length === 0) {
      throw new Error(`No DAO found for treasury address: ${treasuryAddress}`)
    } else if (response.daos[0].proposals.length === 0) {
      throw new Error(`Proposal does not exist: ${proposalNumber.toString()}`)
    }
    return { dao: response.daos[0] }
  } catch (error) {
    console.error('Error fetching DAO id for Dao Treasury:', error)
    throw error
  }
}
