import { v4 as uuidv4 } from 'uuid';

import { getVerificationTokenByEmail } from '@/features/auth/data/vertification-token';
import { db } from '@/lib/prisma';

const VERIFICATION_TOKEN_LIFETIME_MS = 60 * 60 * 1000;

export const generateVerificationToken = async (email: string) => {
  const existingToken = await getVerificationTokenByEmail(email);
  if (existingToken) {
    await db.verificationToken.delete({
      where: {
        id: existingToken.id,
      },
    });
  }

  const expiresAt = new Date().getTime() + VERIFICATION_TOKEN_LIFETIME_MS;

  const verificationToken = await db.verificationToken.create({
    data: {
      email: email,
      token: uuidv4(),
      expires: new Date(expiresAt),
    },
  });

  return verificationToken;
};
