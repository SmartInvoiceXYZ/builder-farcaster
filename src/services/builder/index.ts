import { env } from '@/config'

export const endpoints = [
  env.BUILDER_SUBGRAPH_ETHEREUM_URL,
  env.BUILDER_SUBGRAPH_BASE_URL,
  env.BUILDER_SUBGRAPH_OPTIMISM_URL,
  env.BUILDER_SUBGRAPH_ZORA_URL,
]
