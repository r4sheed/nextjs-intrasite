import { db } from '@/lib/prisma';
import { type Response, response } from '@/lib/response';

import { getVerificationTokenByToken } from '@/features/auth/data/email-verification-token';
import { getUserByEmail } from '@/features/auth/data/user';
import {
  tokenExpired,
  tokenNotFound,
  userNotFound,
} from '@/features/auth/lib/errors';
import { AUTH_SUCCESS } from '@/features/auth/lib/strings';

export type VerifyEmailData = Record<string, never>;

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
    db.emailVerificationToken.delete({
      where: { id: existingToken.id },
    }),
  ]);

  return response.success({
    data: {},
    message: {
      key: AUTH_SUCCESS.emailVerified,
    },
  });
};
