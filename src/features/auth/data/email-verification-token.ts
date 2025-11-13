import { db } from '@/lib/prisma';

import type { EmailVerificationToken } from '@prisma/client';

/**
 * Data access layer for EmailVerificationToken entity.
 *
 * Provides methods to retrieve email verification tokens from the database.
 * Returns null on errors to let the service layer handle error responses.
 */

/**
 * Defines the possible search criteria for a verification token.
 */
type TokenSearch = { token: string } | { email: string };

/**
 * Generic verification token lookup utility with error handling.
 *
 * @param search - Search criteria (either by unique token or by email).
 * @returns The verification token if found, null if not found or on database error.
 */
const findVerificationToken = async (
  search: TokenSearch
): Promise<EmailVerificationToken | null> => {
  try {
    if ('token' in search) {
      return await db.emailVerificationToken.findUnique({
        where: { token: search.token },
      });
    } else {
      return await db.emailVerificationToken.findFirst({
        where: { email: search.email },
      });
    }
  } catch (error) {
    // Log error for debugging but return null (let service layer handle the error)
    console.error('[findVerificationToken] Database error:', error);
    return null;
  }
};

/**
 * Retrieves a verification token by its unique token string.
 *
 * Used during email verification flow when the user clicks the verification link.
 *
 * @param token - The unique verification token string.
 * @returns The verification token if found, null otherwise (including on database errors).
 *
 * @example
 * const verificationToken = await getVerificationTokenByToken('abc123...');
 * if (verificationToken && verificationToken.expires > new Date()) {
 *   // Token is valid
 * }
 */
export const getVerificationTokenByToken = async (
  token: string
): Promise<EmailVerificationToken | null> => {
  return await findVerificationToken({ token });
};

/**
 * Retrieves the first verification token associated with an email address.
 *
 * Used to check if a verification token already exists for a user before
 * generating a new one.
 *
 * @param email - The user's email address.
 * @returns The first verification token for the email if found, null otherwise (including on database errors).
 *
 * @example
 * const existingToken = await getVerificationTokenByEmail('user@example.com');
 * if (existingToken) {
 *   // Delete old token before creating new one
 * }
 */
export const getVerificationTokenByEmail = async (
  email: string
): Promise<EmailVerificationToken | null> => {
  return await findVerificationToken({ email });
};
