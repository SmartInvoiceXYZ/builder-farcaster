import {
  Attestation,
  AttestationJsonData,
  Propdate,
  PropdateObject,
} from '@/services/builder/types'
import { gql, GraphQLClient } from 'graphql-request'
import { flatMap, pipe } from 'remeda'
import { attestationChainEndpoints } from '.'

interface Data {
  attestations: Attestation[]
}

interface Result {
  propdates: Propdate[]
}

export const getAttestations = async (): Promise<Result> => {
  try {
    const propdatesPromises = attestationChainEndpoints.map(
      async ({ chain, endpoint, schemaId }) => {
        const query = gql`
        {
          attestations(
            where: {
              schemaId: {
                equals: "${schemaId}"
              }
              isOffchain: {
                equals: false
              }
            }
          ) {
            recipient
            timeCreated
            decodedDataJson
          }
        }
      `

        const client = new GraphQLClient(endpoint)
        const response = await client.request<Data>(query)
        const propdates = response.attestations
          .map((attestation) => {
            const propdateObject = convertPropdateJsonToObject(
              attestation.decodedDataJson,
            )
            return {
              ...propdateObject,
              recipient: attestation.recipient,
              timeCreated: attestation.timeCreated,
              chain,
            }
          })
          .filter((propdate) => !propdate.replyTo) // Filter out propdates with non-empty replyTo

        return propdates
      },
    )
    const results = await Promise.all(propdatesPromises)

    const propdates = pipe(
      results,
      flatMap((propdates) => propdates),
    )

    return { propdates }
  } catch (error) {
    console.error('Error fetching active proposals:', error)
    throw error
  }
}

/**
 * Converts a JSON string into an Propdate object
 * @param jsonString - The JSON string containing attestation decodedDataJson
 * @returns An object with propId, replyTo, response, and milestoneId
 */
export function convertPropdateJsonToObject(
  jsonString: string,
): PropdateObject {
  try {
    const parsed = JSON.parse(jsonString) as AttestationJsonData[]

    const result = parsed.reduce(
      (acc: Partial<PropdateObject>, item: AttestationJsonData) => {
        const name = item.name
        const value = item.value.value

        switch (name) {
          case 'propId':
            acc.propId = Number(value)
            break
          case 'replyTo':
          case 'response':
            acc[name] = String(value)
            break
          case 'milestoneId':
            acc[name] = Number(value)
            break
        }
        return acc
      },
      {},
    ) as PropdateObject

    return result
  } catch (error) {
    console.error('Error parsing JSON:', error)
    // Return default Attestation object with empty/zero values
    return {
      propId: 0,
      replyTo: '',
      response: '',
      milestoneId: 0,
    }
  }
}
