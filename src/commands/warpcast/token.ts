import { genAuthToken } from '@/services/warpcast/gen-auth-token'
import { password } from '@inquirer/prompts'
import { DateTime } from 'luxon'

/**
 * Prompt the user for a base64-encoded recovery key, decode it, and use it to generate a new authentication token.
 * @returns A promise that resolves when the process is complete.
 */
export async function warpcastToken(): Promise<void> {
  try {
    const recoveryKey = await promptRecoveryKey()
    const mnemonic = decodeRecoveryKey(recoveryKey)
    const { token } = await generateAuthToken(mnemonic)

    displayAuthToken(token)
  } catch (error) {
    console.error(
      'Error:',
      error instanceof Error ? error.message : String(error),
    )
  }
}

/**
 * Prompt the user for the recovery key.
 * @returns The base64-encoded recovery key.
 */
async function promptRecoveryKey(): Promise<string> {
  return password({
    message: 'Please enter your recovery key:',
    mask: '*',
    validate: validateRecoveryKey,
  })
}

/**
 * Validate the recovery key input.
 * @param input The input string to validate.
 * @returns True if valid, otherwise an error message.
 */
function validateRecoveryKey(input: string): boolean | string {
  if (!input.trim()) {
    return 'Recovery key cannot be empty'
  }
  try {
    Buffer.from(input, 'base64')
  } catch {
    return 'Invalid encoded string'
  }
  return true
}

/**
 * Decode the base64-encoded recovery key.
 * @param recoveryKey The base64-encoded recovery key.
 * @returns The decoded recovery key.
 */
function decodeRecoveryKey(recoveryKey: string): string {
  return Buffer.from(recoveryKey, 'base64').toString('utf-8')
}

/**
 * Generate a new authentication token using the recovery key.
 * @param mnemonic The decoded recovery key.
 * @returns A promise that resolves to the generated token.
 */
async function generateAuthToken(
  mnemonic: string,
): Promise<ReturnType<typeof genAuthToken>> {
  const expiresAt = DateTime.now().plus({ years: 1 }).toMillis()
  return genAuthToken(mnemonic, expiresAt)
}

// eslint-disable-next-line jsdoc/require-returns-check
/**
 * Displays the authentication token and its expiration time in the console.
 * @param token - The authentication token object.
 * @param token.secret - The secret part of the token.
 * @param token.expiresAt - The expiration time of the token in milliseconds since epoch.
 * @returns This function does not return a value.
 */
function displayAuthToken(token: { secret: string; expiresAt: number }): void {
  console.log('New auth token generated:', token.secret)
  console.log('Expires at:', DateTime.fromMillis(token.expiresAt).toISO())
}
