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
  '0x8bd0d42901ce3cd9898dbea6ae2fbf1e796ef0923e7cbb0a1cecac2e42d47cb3'

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

const IPFS_ENDPOINTS = [
  `https://ipfs.io/ipfs/`,
  `https://cloudflare-ipfs.com/ipfs/`,
  `https://dweb.link/ipfs/`,
  `https://w3s.link/ipfs/`,
  `https://flk-ipfs.xyz/ipfs/`,
]

/**
 * Strips protocol prefixes from a CID
 * @param cid - The CID that might contain protocol prefixes
 * @returns The CID without protocol prefixes
 */
function stripProtocolFromCid(cid: string): string {
  return cid.replace(/^https?:\/\/|^ipfs:\/\//, '')
}

/**
 * Fetches content from IPFS using multiple gateways
 * @param cid - The IPFS CID to fetch, with or without protocol prefix
 * @returns The content fetched from IPFS as a string
 */
export const fetchFromIPFS = async (
  cid: string | undefined,
): Promise<string> => {
  if (!cid) {
    throw new Error('CID is required')
  }

  const cleanCid = stripProtocolFromCid(cid)
  const controllers = IPFS_ENDPOINTS.map(() => new AbortController())

  try {
    const response = await Promise.any<string>(
      IPFS_ENDPOINTS.map(async (endpoint, index) => {
        const controller = controllers[index]
        const { signal } = controller

        const res = await fetch(`${endpoint}${cleanCid}`, { signal })
        if (res.ok) {
          // Abort other requests once a successful one is found
          controllers.forEach((ctrl, i) => {
            if (i !== index) ctrl.abort()
          })
          const data = await res.text()
          return data
        }
        throw new Error(`Failed to fetch from ${endpoint}`)
      }),
    )

    return response
  } catch (error) {
    console.error(`Failed to fetch from IPFS for CID: ${cleanCid}: `, error)
    throw new Error(`Failed to fetch from IPFS for CID: ${cleanCid}`)
  }
}
