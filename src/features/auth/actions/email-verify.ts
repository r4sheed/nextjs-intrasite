'use server';

import { getUserByEmailWithoutPassword } from '@/features/auth/data/user';
import { getVerificationTokenByToken } from '@/features/auth/data/vertification-token';
import {
  tokenExpired,
  tokenNotFound,
  userNotFound,
} from '@/features/auth/lib/errors';
import { AUTH_UI_MESSAGES } from '@/features/auth/lib/messages';
import { db } from '@/lib/prisma';
import { type Response, failure, success } from '@/lib/response';

/**
 * Verifies a user's email address by validating the provided verification token.
 *
 * Steps performed:
 * 1. Checks that the token exists and hasn't expired.
 * 2. Finds the user by the token's email.
 * 3. Marks the user's email as verified and updates the email if necessary.
 * 4. Deletes the verification token to prevent reuse.
 *
 * All updates are wrapped in a single database transaction to ensure atomicity.
 *
 * @param {string} token - The email verification token from the verification link.
 * @returns {Promise<Response<{ email: string }>>} A response indicating success or failure.
 *
 * @example
 * // Typical usage:
 * const result = await verifyEmail(token);
 * if (isSuccess(result)) {
 *   console.log(`Email ${result.data.email} verified successfully.`);
 * } else if (isError(result)) {
 *   console.error(`Verification failed: ${formatMessage(result.message)}`);
 * }
 */
export const verifyEmail = async (
  token: string
): Promise<Response<{ email: string }>> => {
  // Check token existence
  const existingToken = await getVerificationTokenByToken(token);
  if (!existingToken) {
    return failure(tokenNotFound());
  }

  // Check expiration
  const hasExpired = existingToken.expires.getTime() <= Date.now();
  if (hasExpired) {
    return failure(tokenExpired());
  }

  // Find user
  const user = await getUserByEmailWithoutPassword(existingToken.email);
  if (!user) {
    return failure(userNotFound(existingToken.email));
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

  // Success response
  return success(
    { email: existingToken.email },
    AUTH_UI_MESSAGES.EMAIL_VERIFIED
  );
};
