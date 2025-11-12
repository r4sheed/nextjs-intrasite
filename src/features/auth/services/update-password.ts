import { internalServerError } from '@/lib/errors';
import { db } from '@/lib/prisma';
import { type Response, response } from '@/lib/response';

import { getPasswordResetTokenByToken } from '@/features/auth/data/reset-token';
import { getUserByEmail } from '@/features/auth/data/user';
import {
  tokenExpired,
  tokenNotFound,
  userNotFound,
} from '@/features/auth/lib/errors';
import { AUTH_SUCCESS } from '@/features/auth/lib/strings';
import { User } from '@/features/auth/models';
import { type NewPasswordInput } from '@/features/auth/schemas';

export type UpdatePasswordData = Record<string, never>;
/**
 * Core service to update a user's password after validating a reset token.
 *
 * This service handles the complete password reset flow including token validation,
 * expiration checks, user lookup, password hashing, and executes an atomic database
 * transaction to update the password and delete the consumed token. Uses the User
 * model's hashPassword method for secure password hashing.
 *
 * @param values - Validated input containing the reset token and new password.
 * @returns Response indicating success with confirmation message, or error details.
 *
 * @throws Never throws - all errors are returned as Response<T> error objects.
 */
export const updatePassword = async (
  values: NewPasswordInput
): Promise<Response<UpdatePasswordData>> => {
  const { token, password } = values;

  // Token validation
  const existingToken = await getPasswordResetTokenByToken(token);
  if (!existingToken) {
    return response.failure(tokenNotFound());
  }

  // Check token expiration
  if (existingToken.expires.getTime() <= Date.now()) {
    return response.failure(tokenExpired(token));
  }

  // Retrieve user
  const { email } = existingToken;
  const existingUser = await getUserByEmail(email);
  if (!existingUser) {
    // Should generally not happen if token was created correctly, but handles edge cases
    return response.failure(userNotFound(email));
  }

  // Hash the new password using User model
  const hashedPassword = await User.hashPassword(password);

  // Database Transaction: Update password and delete the used token atomically
  try {
    await db.$transaction([
      // Update user's password
      db.user.update({
        where: { id: existingUser.id },
        data: { password: hashedPassword },
      }),
      // Delete the consumed password reset token
      db.passwordResetToken.delete({
        where: { id: existingToken.id },
      }),
    ]);

    return response.success({
      data: {},
      message: { key: AUTH_SUCCESS.passwordUpdated },
    });
  } catch (error) {
    // Catch any Prisma errors related to the transaction (e.g., connection failure, constraint violation)
    // TODO: Log the error properly using a centralized logger
    console.log(error);
    return response.failure(internalServerError());
  }
};
