import crypt from 'crypto';
import { v4 as uuidv4 } from 'uuid';

import { internalServerError } from '@/lib/errors';
import { db } from '@/lib/prisma';

import {
  getVerificationTokenByEmail,
  getPasswordResetTokenByEmail,
  countTwoFactorTokensSince,
  createTwoFactorToken,
  deleteTwoFactorTokensBefore,
  getTwoFactorTokenByUserId,
} from '@/features/auth/data';
import {
  TOKEN_LIFETIME_MS,
  TWO_FACTOR_RESEND_COOLDOWN_MS,
  TWO_FACTOR_RESEND_MAX_PER_WINDOW,
  TWO_FACTOR_RESEND_WINDOW_MS,
  TWO_FACTOR_TOKEN_LIFETIME_MS,
  TWO_FACTOR_TOKEN_RETENTION_MS,
} from '@/features/auth/lib/config';
import { rateLimitExceeded } from '@/features/auth/lib/errors';

/**
 * Generates a verification token. Deletes the old one if it exists.
 * @param email - User's email.
 */
export const generateVerificationToken = async (email: string) => {
  const data = await getVerificationTokenByEmail(email);
  if (data) {
    await db.verificationToken.delete({
      where: {
        id: data.id,
      },
    });
  }

  const token = uuidv4();
  const currentTime = new Date().getTime();
  const expiresAt = new Date(currentTime + TOKEN_LIFETIME_MS);

  const result = await db.verificationToken.create({
    data: {
      email: email,
      token: token,
      expires: expiresAt,
    },
  });

  return result;
};

/**
 * Generates a password reset token. Deletes the old one if it exists.
 * @param email - User's email.
 */
export const generatePasswordResetToken = async (email: string) => {
  const data = await getPasswordResetTokenByEmail(email);
  if (data) {
    await db.passwordResetToken.delete({
      where: {
        id: data.id,
      },
    });
  }

  const token = uuidv4();
  const currentTime = new Date().getTime();
  const expiresAt = new Date(currentTime + TOKEN_LIFETIME_MS);

  const result = await db.passwordResetToken.create({
    data: {
      email: email,
      token: token,
      expires: expiresAt,
    },
  });

  return result;
};

/**
 * Generates a two-factor authentication token with resend safeguards.
 *
 * This function contains the business logic for 2FA token generation:
 * 1. Allows one immediate resend even within the cooldown window.
 * 2. Enforces cooldown for additional resend attempts.
 * 3. Applies a rolling window limit to mitigate abuse.
 * 4. Deletes stale tokens after issuance to reduce storage.
 * 5. Generates and persists the new token.
 *
 * @param userId - The user's unique ID.
 * @returns The newly generated TwoFactorToken.
 * @throws {AppError} - Throws `rateLimitExceeded` when cooldown/window limits are exceeded.
 */
export const generateTwoFactorToken = async (userId: string) => {
  // Evaluate resend window before generating new token
  const existingToken = await getTwoFactorTokenByUserId(userId);
  const windowStart = new Date(Date.now() - TWO_FACTOR_RESEND_WINDOW_MS);
  const tokensInWindow = await countTwoFactorTokensSince(userId, windowStart);

  if (existingToken) {
    const resendThreshold = new Date(
      Date.now() - TWO_FACTOR_RESEND_COOLDOWN_MS
    );

    const withinCooldownWindow = existingToken.createdAt > resendThreshold;
    const hasPriorResend = tokensInWindow > 1;

    if (withinCooldownWindow && hasPriorResend) {
      // Only enforce cooldown after the first resend attempt
      throw rateLimitExceeded();
    }
  }

  if (tokensInWindow >= TWO_FACTOR_RESEND_MAX_PER_WINDOW) {
    throw rateLimitExceeded();
  }

  // 3. Generate a new 6-digit token
  const token = crypt.randomInt(100_000, 999_999).toString();
  const expires = new Date(Date.now() + TWO_FACTOR_TOKEN_LIFETIME_MS);

  // 4. Call data layer to create the new token
  const newTwoFactorToken = await createTwoFactorToken(userId, token, expires);

  if (!newTwoFactorToken) {
    throw internalServerError();
  }

  const retentionBoundary = new Date(
    Date.now() - TWO_FACTOR_TOKEN_RETENTION_MS
  );
  await deleteTwoFactorTokensBefore(userId, retentionBoundary);

  return newTwoFactorToken;
};
