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

const attestationEndpoints: Record<number, string> = {
  1: 'https://easscan.org/graphql',
  10: 'https://optimism.easscan.org/graphql',
  8453: 'https://base.easscan.org/graphql',
}

const PROPDATES_SCHEMA_ID =
  '0x9ee9a1bfbf4f8f9b977c6b30600d6131d2a56d0be8100e2238a057ea8b18be7e'

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

export const attestationChainEndpoints = chains
  .filter((chain) => chain.id != 7777777)
  .map((chain) => {
    const endpoint = attestationEndpoints[chain.id]
    const schemaId = PROPDATES_SCHEMA_ID
    if (!endpoint) {
      throw new Error(`Endpoint not found for chain ID: ${chain.id.toString()}`)
    }
    return {
      chain,
      endpoint,
      schemaId,
    }
  })
