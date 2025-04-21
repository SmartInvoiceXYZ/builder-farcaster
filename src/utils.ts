import { DateTime } from 'luxon'

/**
 * Converts a given timestamp to a relative time string.
 * @param timestamp - The timestamp to be converted.
 * @returns A relative time string.
 */
export function toRelativeTime(timestamp: number): string {
  return DateTime.fromSeconds(timestamp).toRelative({
    style: 'long',
    unit: ['days', 'hours', 'minutes'],
  })
}

/**
 * Checks if a given timestamp is in the past.
 * @param timestamp - The timestamp in seconds to be evaluated.
 * @returns true if the timestamp is in the past, false otherwise.
 */
export function isPast(timestamp: number) {
  return DateTime.fromSeconds(timestamp) < DateTime.now()
}

/**
 * shorten Hex address for caching
 * @param address the Hex that needs to be shorten
 * @returns A shortened version of the address in the format "0x1234...5678"
 */
export const shortenAddress = (address: string) => {
  return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`
}
