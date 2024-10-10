import { DateTime } from 'luxon'

/**
 * Converts a given timestamp to a relative time string.
 * @param timestamp - The timestamp to be converted.
 * @returns A relative time string.
 */
export function toRelativeTime(timestamp: number): string {
  return DateTime.fromSeconds(timestamp).toRelative({
    style: 'long',
    unit: ['hours', 'minutes'],
  })
}
