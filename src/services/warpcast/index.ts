import { first } from 'remeda'

export enum HttpRequestMethod {
  GET = 'GET',
  POST = 'POST',
  PUT = 'PUT',
  DELETE = 'DELETE',
}

export interface FetchOptions {
  params?: Record<string, string>
  json?: Record<string, unknown>
  headers?: Record<string, string>
}

export interface FetchResponse {
  errors?: { message: string }[]

  [key: string]: unknown
}

/**
 * Performs a HTTP request to the specified path using the provided method and options.
 * @param baseUrl - The base URL to prepend to the path.
 * @param authToken - The auth token to include in the request headers.
 * @param method - The HTTP method to use for the request.
 * @param path - The path to append to the base URL for the request.
 * @param [options] - Additional options for the request.
 * @returns - A promise that resolves with the response data.
 */
export async function fetchRequest<T>(
  baseUrl: string,
  authToken: string | undefined,
  method: HttpRequestMethod,
  path: string,
  options?: FetchOptions,
): Promise<T> {
  const url = new URL(path, baseUrl)
  url.search = new URLSearchParams(options?.params ?? {}).toString()

  const response = await fetch(url.toString(), {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(authToken && { Authorization: `Bearer ${authToken}` }),
      ...options?.headers,
    },
    body:
      method !== HttpRequestMethod.GET
        ? JSON.stringify(options?.json)
        : undefined,
  })

  const data: FetchResponse = (await response.json()) as FetchResponse
  if (data.errors && data.errors.length > 0) {
    throw new Error(first(data.errors)?.message)
  }

  return data as T
}
