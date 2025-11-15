import { logger } from '@/lib/logger';
import { db } from '@/lib/prisma';

import type { TwoFactorConfirmation } from '@prisma/client';

/**
 * Retrieves the 2FA confirmation associated with the provided user ID.
 *
 * @param userId - Unique identifier of the user.
 * @returns The confirmation record or null when not found or on data access error.
 */
export const getTwoFactorConfirmationByUserId = async (
  userId: string
): Promise<TwoFactorConfirmation | null> => {
  try {
    return await db.twoFactorConfirmation.findUnique({
      where: { userId },
    });
  } catch (error) {
    logger.forDatabase().error(
      {
        userId,
        error,
      },
      'Database error in getTwoFactorConfirmationByUserId'
    );
    return null;
  }
};

/**
 * Creates (or replaces) the 2FA confirmation record for the given user.
 *
 * Any existing confirmation is removed prior to creation to keep the table in sync
 * with the latest verification attempt.
 *
 * @param userId - Unique identifier of the user.
 * @returns The created confirmation record or null when the operation fails.
 */
export const createTwoFactorConfirmation = async (
  userId: string
): Promise<TwoFactorConfirmation | null> => {
  try {
    await db.twoFactorConfirmation.deleteMany({
      where: { userId },
    });

    return await db.twoFactorConfirmation.create({
      data: { userId },
    });
  } catch (error) {
    logger.forDatabase().error(
      {
        userId,
        error,
      },
      'Database error in createTwoFactorConfirmation'
    );
    return null;
  }
};

/**
 * Deletes the 2FA confirmation associated with the provided user ID.
 *
 * @param userId - Unique identifier of the user whose confirmation should be removed.
 * @returns true when the deletion succeeds, null on data access error.
 */
export const deleteTwoFactorConfirmation = async (
  userId: string
): Promise<boolean | null> => {
  try {
    const result = await db.twoFactorConfirmation.deleteMany({
      where: { userId },
    });

    return result.count > 0;
  } catch (error) {
    logger.forDatabase().error(
      {
        userId,
        error,
      },
      'Database error in deleteTwoFactorConfirmation'
    );
    return null;
  }
};
