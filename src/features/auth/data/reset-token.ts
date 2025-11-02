import type { PasswordResetToken } from '@prisma/client';

import { db } from '@/lib/prisma';

/**
 * Data access layer for PasswordResetToken entity.
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
 * @returns The password reset token if found, null if not found or on database error.
 */
const findPasswordResetToken = async (
  search: TokenSearch
): Promise<PasswordResetToken | null> => {
  try {
    if ('token' in search) {
      return await db.passwordResetToken.findUnique({
        where: { token: search.token },
      });
    } else {
      return await db.passwordResetToken.findFirst({
        where: { email: search.email },
      });
    }
  } catch (error) {
    // Log error for debugging but return null (let service layer handle the error)
    console.error('[findPasswordResetToken] Database error:', error);
    return null;
  }
};

/**
 * Retrieves a password reset token by its unique token string.
 *
 * Used during password reset flow when the user clicks the reset link from email.
 *
 * @param token - The unique password reset token string.
 * @returns The password reset token if found, null otherwise (including on database errors).
 *
 * @example
 * const resetToken = await getPasswordResetTokenByToken('xyz789...');
 * if (resetToken && resetToken.expires > new Date()) {
 *   // Token is valid, allow password reset
 * }
 */
export const getPasswordResetTokenByToken = async (
  token: string
): Promise<PasswordResetToken | null> => {
  return await findPasswordResetToken({ token });
};

/**
 * Retrieves the first password reset token associated with an email address.
 *
 * Used to check if a reset token already exists for a user before generating
 * a new one, preventing token spam.
 *
 * @param email - The user's email address.
 * @returns The first password reset token for the email if found, null otherwise (including on database errors).
 *
 * @example
 * const existingToken = await getPasswordResetTokenByEmail('user@example.com');
 * if (existingToken) {
 *   // Delete old token before creating new one
 * }
 */
export const getPasswordResetTokenByEmail = async (
  email: string
): Promise<PasswordResetToken | null> => {
  return await findPasswordResetToken({ email });
};
