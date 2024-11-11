import { env } from '@/config'
import { fetchRequest, HttpRequestMethod } from '@/services/warpcast/index'
import canonicalize from 'canonicalize'
import { toBytes } from 'viem'
import { mnemonicToAccount } from 'viem/accounts'

interface Result {
  token: AuthToken
}

interface Response {
  result: Result
}

interface AuthToken {
  secret: string
  expiresAt: number
}

/**
 * Generates an authentication token using the provided mnemonic and expiration time.
 * @param mnemonic - The mnemonic phrase used to generate the bearer token.
 * @param expiresAt - The timestamp indicating when the token will expire.
 * @returns A promise that resolves to the result of the token generation process.
 */
export async function genAuthToken(
  mnemonic: string,
  expiresAt: number,
): Promise<Result> {
  const { WARPCAST_BASE_URL: baseUrl } = env

  const payload = {
    method: 'generateToken',
    params: {
      timestamp: Date.now(),
      expiresAt,
    },
  }

  const account = mnemonicToAccount(mnemonic)
  const payloadString = canonicalize(payload) ?? ''

  const signature = await account.signMessage({ message: payloadString })
  const encodedSignature = Buffer.from(toBytes(signature)).toString('base64')
  const bearerToken = `eip191:${encodedSignature}`

  const { result } = await fetchRequest<Response>(
    baseUrl,
    bearerToken,
    HttpRequestMethod.PUT,
    '/v2/auth',
    { json: payload },
  )

  return result
}
