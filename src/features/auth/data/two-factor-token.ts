import { logger } from '@/lib/logger';
import { db } from '@/lib/prisma';

import type { TwoFactorToken } from '@prisma/client';

/**
 * Data access layer for 2FA token entity.
 *
 * Provides methods to retrieve two-factor authentication tokens from the database.
 * Returns null on errors to let the service layer handle error responses.
 */

/**
 * Retrieves the most recent two-factor token for a given user ID.
 * @param userId - The user's unique identifier.
 * @returns The most recent TwoFactorToken or null if not found or on error.
 */
export const getTwoFactorTokenByUserId = async (
  userId: string
): Promise<TwoFactorToken | null> => {
  try {
    return await db.twoFactorToken.findFirst({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  } catch (error) {
    logger.forDatabase().error(
      {
        userId,
        error,
      },
      'Error fetching 2FA token by userId'
    );
    return null;
  }
};

/**
 * Retrieves a two-factor token by its token string.
 *
 * Used during 2FA verification flow when the user enters the code.
 *
 * @param token - The unique token string (6-digit code).
 * @returns The TwoFactorToken if found, null otherwise.
 */
export const getTwoFactorTokenByToken = async (
  token: string
): Promise<TwoFactorToken | null> => {
  try {
    return await db.twoFactorToken.findUnique({
      where: { token },
    });
  } catch (error) {
    logger.forDatabase().error(
      {
        token,
        error,
      },
      'Error fetching 2FA token by token'
    );
    return null;
  }
};

/**
 * Retrieves a two-factor token by its unique ID.
 *
 * @param id - Identifier of the two-factor token.
 * @returns The TwoFactorToken if found, null otherwise.
 */
export const getTwoFactorTokenById = async (
  id: string
): Promise<TwoFactorToken | null> => {
  try {
    return await db.twoFactorToken.findUnique({
      where: { id },
    });
  } catch (error) {
    logger.forDatabase().error(
      {
        id,
        error,
      },
      'Error fetching 2FA token by id'
    );
    return null;
  }
};

/**
 * Creates a new two-factor token for a user.
 * This is a pure data access function. Business logic (like deleting old tokens)
 * should be handled in the service/lib layer.
 *
 * @param userId - The user's ID.
 * @param token - The 6-digit code.
 * @param expires - The token's expiration timestamp.
 * @returns The created TwoFactorToken or null on error.
 */
export const createTwoFactorToken = async (
  userId: string,
  token: string,
  expires: Date
): Promise<TwoFactorToken | null> => {
  try {
    return await db.twoFactorToken.create({
      data: {
        userId,
        token,
        expires,
      },
    });
  } catch (error) {
    logger.forDatabase().error(
      {
        userId,
        token,
        expires,
        error,
      },
      'Error creating 2FA token'
    );
    return null;
  }
};

/**
 * Deletes two-factor tokens for a specific user created before the provided timestamp.
 *
 * @param userId - The ID of the user whose stale tokens should be deleted.
 * @param before - Timestamp; tokens older than this will be removed.
 * @returns true if deletion was successful, null on error.
 */
export const deleteTwoFactorTokensBefore = async (
  userId: string,
  before: Date
): Promise<boolean | null> => {
  try {
    await db.twoFactorToken.deleteMany({
      where: {
        userId,
        createdAt: { lt: before },
      },
    });
    return true;
  } catch (error) {
    logger.forDatabase().error(
      {
        userId,
        before,
        error,
      },
      'Error deleting stale 2FA tokens'
    );
    return null;
  }
};

/**
 * Increments the failed attempt counter for a two-factor token.
 *
 * @param tokenId - The ID of the token to update.
 * @returns The updated TwoFactorToken or null on error.
 */
export const incrementTwoFactorAttempts = async (
  tokenId: string
): Promise<TwoFactorToken | null> => {
  try {
    return await db.twoFactorToken.update({
      where: { id: tokenId },
      data: { attempts: { increment: 1 } },
    });
  } catch (error) {
    logger.forDatabase().error(
      {
        tokenId,
        error,
      },
      'Error incrementing 2FA attempts'
    );
    return null;
  }
};

/**
 * Deletes a two-factor token by its ID.
 *
 * @param tokenId - The ID of the token to delete.
 * @returns true if deleted successfully, null on error.
 */
export const deleteTwoFactorToken = async (
  tokenId: string
): Promise<boolean | null> => {
  try {
    await db.twoFactorToken.delete({
      where: { id: tokenId },
    });
    return true;
  } catch (error) {
    logger.forDatabase().error(
      {
        tokenId,
        error,
      },
      'Error deleting 2FA token'
    );
    return null;
  }
};

/**
 * Counts how many two-factor tokens the user generated since the provided timestamp.
 *
 * @param userId - The ID of the user.
 * @param since - Timestamp to measure from.
 * @returns Number of tokens created since the timestamp.
 */
export const countTwoFactorTokensSince = async (
  userId: string,
  since: Date
): Promise<number> =>
  await db.twoFactorToken.count({
    where: {
      userId,
      createdAt: { gte: since },
    },
  });
