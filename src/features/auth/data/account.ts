import { db } from '@/lib/prisma';

/**
 * Retrieves the OAuth account associated with a user by their user ID.
 * @param userId - The ID of the user to find the account for.
 * @returns The account if found, otherwise null.
 */
export const getAccountByUserId = async (userId: string) => {
  try {
    const account = await db.account.findFirst({
      where: { userId },
    });

    return account;
  } catch {
    return null;
  }
};
