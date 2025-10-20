import type { VerificationToken } from '@prisma/client';

import { db } from '@/lib/prisma';

export const getVerificationTokenByToken = async (
  token: string
): Promise<VerificationToken | null> => {
  try {
    const verificationToken = await db.verificationToken.findUnique({
      where: { token },
    });
    return verificationToken;
  } catch (error) {
    return null;
  }
};

export const getVerificationTokenByEmail = async (
  email: string
): Promise<VerificationToken | null> => {
  try {
    const verificationToken = await db.verificationToken.findFirst({
      where: { email },
    });
    return verificationToken;
  } catch (error) {
    return null;
  }
};
