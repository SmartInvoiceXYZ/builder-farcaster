import { fetchRequest, HttpRequestMethod } from '@/services/warpcast/index'
import { Env, User } from '@/services/warpcast/types'

interface Result {
  user: User
}

interface Response {
  result: Result
}

export const getMe = async (env: Env): Promise<Result> => {
  const { WARPCAST_AUTH_TOKEN: authToken, WARPCAST_BASE_URL: baseUrl } = env

  const { result } = await fetchRequest<Response>(
    baseUrl,
    authToken,
    HttpRequestMethod.GET,
    '/v2/me',
    {},
  )

  return result
}
