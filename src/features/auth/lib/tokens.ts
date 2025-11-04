import crypt from 'crypto';
import { v4 as uuidv4 } from 'uuid';

import { db } from '@/lib/prisma';

import { getPasswordResetTokenByEmail } from '@/features/auth/data/reset-token';
import { getTwoFactorTokenByEmail } from '@/features/auth/data/two-factor-token';
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

/**
 * Generates a two-factor authentication token. Deletes the old one if it exists.
 * @param email - User's email.
 * @return The generated two-factor authentication token.
 */
export const generateTwoFactorToken = async (email: string) => {
  const token = crypt.randomInt(100_000, 999_999).toString();
  const expiresAt = new Date(Date.now() + TOKEN_LIFETIME_MS); // TODO: Change to shorter duration

  const existingToken = await getTwoFactorTokenByEmail(email);
  if (existingToken) {
    await db.twoFactorToken.delete({ where: { id: existingToken.id } });
  }

  const result = await db.twoFactorToken.create({
    data: {
      email,
      token,
      expires: expiresAt,
    },
  });

  return result;
};
