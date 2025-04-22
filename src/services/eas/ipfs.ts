const IPFS_ENDPOINTS = [
  `https://ipfs.io/ipfs/`,
  `https://cloudflare-ipfs.com/ipfs/`,
  `https://dweb.link/ipfs/`,
  `https://w3s.link/ipfs/`,
  `https://flk-ipfs.xyz/ipfs/`,
]

const REQUEST_TIMEOUT = 10000 // 10 seconds

/**
 * Fetches content from IPFS using multiple gateways
 * @param cid - The IPFS CID to fetch, with or without protocol prefix
 * @returns The content fetched from IPFS as a string
 */
const fetchFromIPFS = async (cid: string | undefined): Promise<string> => {
  if (!cid) {
    throw new Error('CID is required')
  }

  const controllers = IPFS_ENDPOINTS.map(() => new AbortController())

  try {
    const response = await Promise.any<string>(
      IPFS_ENDPOINTS.map(async (endpoint, index) => {
        const controller = controllers[index]
        const { signal } = controller

        const res = await fetch(`${endpoint}${cid}`, {
          signal,
          // Adding timeout options
          headers: { 'Cache-Control': 'no-cache' },
        })

        // Set a timeout to abort this specific request
        const timeoutId = setTimeout(() => {
          if (!controller.signal.aborted) {
            controller.abort()
          }
        }, REQUEST_TIMEOUT)

        if (res.ok) {
          clearTimeout(timeoutId)
          // Abort other requests once a successful one is found
          controllers.forEach((ctrl, i) => {
            if (i !== index) ctrl.abort()
          })
          const data = await res.text()
          return data
        }
        clearTimeout(timeoutId)
        throw new Error(`Failed to fetch from ${endpoint}`)
      }),
    )

    return response
  } catch (error) {
    console.error(`Failed to fetch from IPFS for CID: ${cid}: `, error)
    throw new Error(`Failed to fetch from IPFS for CID: ${cid}`)
  }
}

const fetchWithTimeout = async (url: string) => {
  try {
    const controller = new AbortController()
    const { signal } = controller

    // Set a 10s timeout for the request
    const timeoutId = setTimeout(function () {
      controller.abort()
    }, REQUEST_TIMEOUT)

    const res = await fetch(url, { signal })
    clearTimeout(timeoutId)

    if (!res.ok) {
      throw new Error(`HTTP error! Status: ${res.status.toString()}`)
    }

    return await res.text()
  } catch (error) {
    console.error(`Failed to fetch from URL: ${url}`, error)
    throw new Error(`Failed to fetch from URL: ${url}`)
  }
}

/**
 * Fetches content from a URL
 * @param url - The URL to fetch, can be http, https, or ipfs
 * @returns The content fetched from the URI as a string
 */
export const fetchFromURL = async (url: string): Promise<string> => {
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return fetchWithTimeout(url)
  }
  if (url.startsWith('ipfs://')) {
    return fetchFromIPFS(url.replace('ipfs://', ''))
  }
  throw new Error(`Unsupported URI: ${url}`)
}
