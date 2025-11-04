import { db } from '@/lib/prisma';

import type { TwoFactorToken } from '@prisma/client';

/**
 * Data access layer for TwoFactorToken entity.
 *
 * Provides methods to retrieve password reset tokens from the database.
 * Returns null on errors to let the service layer handle error responses.
 */

/**
 * Defines the possible search criteria for a password reset token.
 */
type TokenSearch = { token: string } | { email: string };

/**
 * Generic password reset token lookup utility with error handling.
 *
 * @param search - Search criteria (either by unique token or by email).
 * @returns The token if found, null if not found or on database error.
 */
const findTwoFactorToken = async (
  search: TokenSearch
): Promise<TwoFactorToken | null> => {
  try {
    if ('token' in search) {
      return await db.twoFactorToken.findUnique({
        where: { token: search.token },
      });
    } else {
      return await db.twoFactorToken.findFirst({
        where: { email: search.email },
      });
    }
  } catch (error) {
    // Log error for debugging but return null (let service layer handle the error)
    console.error('[findTwoFactorToken] Database error:', error);
    return null;
  }
};

/**
 * Retrieves a password reset token by its unique token string.
 *
 * Used during password reset flow when the user clicks the reset link from email.
 *
 * @param token - The unique token string.
 * @returns The token if found, null otherwise (including on database errors).
 *
 * @example
 * const token = await getTwoFactorTokenByToken('xyz789...');
 * if (token && token.expires > new Date()) {
 *   // Token is valid, allow password reset
 * }
 */
export const getTwoFactorTokenByToken = async (
  token: string
): Promise<TwoFactorToken | null> => {
  return await findTwoFactorToken({ token });
};

/**
 * Retrieves the first password reset token associated with an email address.
 *
 * Used to check if a reset token already exists for a user before generating
 * a new one, preventing token spam.
 *
 * @param email - The user's email address.
 * @returns The first token for the email if found, null otherwise (including on database errors).
 *
 * @example
 * const existingToken = await getTwoFactorTokenByEmail('user@example.com');
 * if (existingToken) {
 *   // Delete old token before creating new one
 * }
 */
export const getTwoFactorTokenByEmail = async (
  email: string
): Promise<TwoFactorToken | null> => {
  return await findTwoFactorToken({ email });
};
