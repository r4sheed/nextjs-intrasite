import { db } from '@/lib/prisma';
import { type Response, response } from '@/lib/response';

import { getUserByEmail } from '@/features/auth/data/user';
import { getVerificationTokenByToken } from '@/features/auth/data/verification-token';
import {
  tokenExpired,
  tokenNotFound,
  userNotFound,
} from '@/features/auth/lib/errors';
import { AUTH_UI_MESSAGES } from '@/features/auth/lib/messages';

import type { VerifyEmailData } from '@/features/auth/actions';

/**
 * Core service to verify a user's email address using a verification token.
 *
 * This service handles token lookup, expiration validation, user retrieval,
 * and executes an atomic database transaction to update the user's email
 * verification status and delete the consumed token. Ensures data consistency
 * by using Prisma transactions.
 *
 * @param token - The verification token string from the email link or URL.
 * @returns Response indicating success with verification message, or error details.
 *
 * @throws Never throws - all errors are returned as Response<T> error objects.
 *
 * @example
 * const result = await verifyEmail('verification-token-123');
 * if (result.status === Status.Success) {
 *   console.log('Email verified for:', result.data.email);
 * }
 */
export const verifyEmail = async (
  token: string
): Promise<Response<VerifyEmailData>> => {
  const existingToken = await getVerificationTokenByToken(token);
  if (!existingToken) {
    return response.failure(tokenNotFound());
  }

  const hasExpired = existingToken.expires.getTime() <= Date.now();
  if (hasExpired) {
    return response.failure(tokenExpired());
  }

  const user = await getUserByEmail(existingToken.email);
  if (!user) {
    return response.failure(userNotFound(existingToken.email));
  }

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
    data: {},
    message: {
      key: AUTH_UI_MESSAGES.EMAIL_VERIFIED,
    },
  });
};
