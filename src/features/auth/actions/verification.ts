'use server';

import { getUserByEmail } from '@/features/auth/data/user';
import { getVerificationTokenByToken } from '@/features/auth/data/vertification';
import {
  tokenExpired,
  tokenNotFound,
  userNotFound,
} from '@/features/auth/lib/errors';
import { AUTH_UI_MESSAGES } from '@/features/auth/lib/messages';
import { db } from '@/lib/prisma';
import { type Response, response } from '@/lib/result';

export type VerificationData = {};

/**
 * Verify email action - validates token and calls service layer
 */
export const verify = async (
  token: string
): Promise<Response<VerificationData>> => {
  // Check token existence
  const existingToken = await getVerificationTokenByToken(token);
  if (!existingToken) {
    return response.error(tokenNotFound());
  }

  // Check expiration
  const hasExpired = existingToken.expires.getTime() <= Date.now();
  if (hasExpired) {
    return response.error(tokenExpired());
  }

  // Find user
  const user = await getUserByEmail(existingToken.email);
  if (!user) {
    return response.error(userNotFound(existingToken.email));
  }

  // Transaction: update user and delete token atomically
  await db.$transaction([
    db.user.update({
      where: { id: user.id },
      data: {
        emailVerified: new Date(),
        email: existingToken.email,
      },
    }),
    db.verificationToken.delete({
      where: { id: existingToken.id },
    }),
  ]);

  return response.success({
    message: {
      key: AUTH_UI_MESSAGES.EMAIL_VERIFIED,
    },
  });
};
