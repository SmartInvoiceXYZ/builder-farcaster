import { env } from '@/config'
import { Chain } from '@/services/builder/types'

export const chains: Chain[] = [
  {
    id: 1,
    name: 'Ethereum',
  },
  {
    id: 10,
    name: 'Optimism',
  },
  {
    id: 8453,
    name: 'Base',
  },
  {
    id: 7777777,
    name: 'Zora',
  },
]

export const endpoints: Record<number, string> = {
  1: env.BUILDER_SUBGRAPH_ETHEREUM_URL,
  10: env.BUILDER_SUBGRAPH_OPTIMISM_URL,
  8453: env.BUILDER_SUBGRAPH_BASE_URL,
  7777777: env.BUILDER_SUBGRAPH_ZORA_URL,
}

export const attestationsEndpoints: Record<number, string> = {
  1: env.EASSCAN_GRAPHQL_ETHEREUM_ENDPOINT,
  10: env.EASSCAN_GRAPHQL_OPTIMISM_ENDPOINT,
  8453: env.EASSCAN_GRAPHQL_BASE_ENDPOINT,
}

export const chainEndpoints = chains.map((chain) => {
  const endpoint: string | undefined = endpoints[chain.id]
  if (!endpoint) {
    throw new Error(`Endpoint not found for chain ID: ${chain.id.toString()}`)
  }
  return {
    chain,
    endpoint,
  }
})

export const attestationsChainsEndpoints = chains
  .filter((chain) => chain.id != 7777777)
  .map((chain) => {
    const endpoint: string | undefined = attestationsEndpoints[chain.id]
    const schemaId: string | undefined = env.PROPDATE_SCHEMA_ID
    if (!endpoint) {
      throw new Error(`Endpoint not found for chain ID: ${chain.id.toString()}`)
    }
    return {
      chain,
      endpoint,
      schemaId,
    }
  })
