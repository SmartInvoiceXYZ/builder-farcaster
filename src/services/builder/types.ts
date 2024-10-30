export interface Env {
  BUILDER_SUBGRAPH_ETHEREUM_URL: string
  BUILDER_SUBGRAPH_BASE_URL: string
  BUILDER_SUBGRAPH_OPTIMISM_URL: string
  BUILDER_SUBGRAPH_ZORA_URL: string
}

export interface Dao {
  id: string
  name: string
  ownerCount: number
}

export interface Owner {
  id: string
  owner: string
  dao: Dao
  daoTokenCount: number
}

export interface Proposal {
  id: string
  proposalNumber: number
  dao: Dao
  title: string
  proposer: string
  timeCreated: string
  voteStart: string
  voteEnd: string
}
