import { v4 as uuidv4 } from 'uuid';

import { db } from '@/lib/prisma';

import { getPasswordResetTokenByEmail } from '@/features/auth/data/reset-token';
import { getVerificationTokenByEmail } from '@/features/auth/data/verification-token';
import { TOKEN_LIFETIME_MS } from '@/features/auth/lib/config';

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
