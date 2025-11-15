import { logger } from '@/lib/logger';
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
    logger.forDatabase().error('Database error in findVerificationToken', {
      search,
      error,
    });
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
 * Retrieves a verification token by both email and token for enhanced security and performance.
 *
 * Uses the composite unique index [email, token] for efficient database queries.
 * This provides better performance than token-only lookups and additional validation
 * that the token belongs to the expected email address.
 *
 * @param email - The user's email address.
 * @param token - The unique verification token string.
 * @returns The verification token if found and matches both email and token, null otherwise (including on database errors).
 *
 * @example
 * const verificationToken = await getVerificationTokenByEmailAndToken('user@example.com', 'abc123...');
 * if (verificationToken && verificationToken.expires > new Date()) {
 *   // Token is valid and belongs to the correct email
 * }
 */
export const getVerificationTokenByEmailAndToken = async (
  email: string,
  token: string
): Promise<EmailVerificationToken | null> => {
  try {
    return await db.emailVerificationToken.findUnique({
      where: {
        email_token: {
          email,
          token,
        },
      },
    });
  } catch (error) {
    // Log error for debugging but return null (let service layer handle the error)
    logger
      .forDatabase()
      .error('Database error in getVerificationTokenByEmailAndToken', {
        email,
        token,
        error,
      });
    return null;
  }
};

/**
 * Retrieves a verification token by email address.
 *
 * Used to check if a verification token already exists for a user before generating
 * a new one, preventing token spam.
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
