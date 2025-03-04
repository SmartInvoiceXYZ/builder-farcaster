export interface Env {
  BUILDER_SUBGRAPH_ETHEREUM_URL: string
  BUILDER_SUBGRAPH_BASE_URL: string
  BUILDER_SUBGRAPH_OPTIMISM_URL: string
  BUILDER_SUBGRAPH_ZORA_URL: string
  EASSCAN_GRAPHQL_ETHEREUM_ENDPOINT: string
  EASSCAN_GRAPHQL_OPTIMISM_ENDPOINT: string
  EASSCAN_GRAPHQL_BASE_ENDPOINT: string
  PROPDATE_SCHEMA_ID: string
}

export interface Chain {
  id: number
  name: string
}

export interface Dao {
  id: string
  name: string
  ownerCount: number
  chain: Chain
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

export interface Attestation {
  recipient: string
  decodedDataJson: string
  timeCreated: number
}

export interface AttestationJsonData {
  name: string
  type: string
  signature: string
  value: {
    name: string
    type: string
    value: string | number
  }
}

export interface PropdateObject {
  propId: number
  replyTo: string
  response: string
  milestoneId: number
}

export interface Propdate extends PropdateObject {
  chain: Chain
  recipient: string
  timeCreated: number
}

export interface UpdateDao {
  id: string
  name: string
  proposals: {
    title: string
  }[]
}
