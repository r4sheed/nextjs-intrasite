import type { PasswordResetToken } from '@prisma/client';

import { db } from '@/lib/prisma';

/**
 * Defines the possible search criteria for a password reset token.
 */
type TokenSearch = { token: string } | { email: string };

/**
 * Retrieves a password reset token by token (unique) or email (first one found).
 */
const getPasswordResetToken = async (
  search: TokenSearch
): Promise<PasswordResetToken | null> => {
  if ('token' in search) {
    return db.passwordResetToken.findUnique({
      where: search,
    });
  } else {
    return db.passwordResetToken.findFirst({
      where: search,
    });
  }
};

/**
 * Finds a password reset token using the unique token string.
 */
export const getPasswordResetTokenByToken = async (
  token: string
): Promise<PasswordResetToken | null> => {
  return getPasswordResetToken({ token });
};

/**
 * Finds the first password reset token associated with the given email.
 */
export const getPasswordResetTokenByEmail = async (
  email: string
): Promise<PasswordResetToken | null> => {
  return getPasswordResetToken({ email });
};
