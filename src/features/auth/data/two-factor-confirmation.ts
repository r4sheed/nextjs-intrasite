import { db } from '@/lib/prisma';

export const getTwoFactorConfirmationByUserId = async (userId: string) => {
  try {
    return await db.twoFactorConfirmation.findUnique({
      where: { userId },
    });
  } catch (error) {
    console.error('[getTwoFactorConfirmationByUserId] Database error:', error);
    return null;
  }
};
