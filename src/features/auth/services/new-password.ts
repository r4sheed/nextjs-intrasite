import bcrypt from 'bcryptjs';

import { internalServerError } from '@/lib/errors';
import { db } from '@/lib/prisma';
import { type Response } from '@/lib/response';
import { response } from '@/lib/response';

import { getPasswordResetTokenByToken } from '@/features/auth/data/reset-token';
import { getUserByEmail } from '@/features/auth/data/user';
import {
  tokenExpired,
  tokenNotFound,
  userNotFound,
} from '@/features/auth/lib/errors';

import { NewPasswordData } from '@/features/auth/actions';
import { type NewPasswordInput } from '@/features/auth/schemas';

import { AUTH_UI_MESSAGES } from '../lib/messages';

/**
 * Handles setting a new password for a user after a successful password reset token validation.
 *
 * This function performs token lookup, expiration check, user retrieval, password hashing,
 * and finally executes an atomic database transaction to update the password and delete the token.
 *
 * @param values - Contains the reset token and the new password.
 * @returns A Response object indicating success or failure with a specific error.
 */
export const setNewPassword = async (
  values: NewPasswordInput
): Promise<Response<NewPasswordData>> => {
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
    // Should generally not happen if token was created correctly, but handles edge cases.
    return response.failure(userNotFound(email));
  }

  // Hash the new password with a salt round of 10
  const hashedPassword = await bcrypt.hash(password, 10);

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
      message: { key: AUTH_UI_MESSAGES.PASSWORD_UPDATED_SUCCESS },
    });
  } catch (error) {
    // Catch any Prisma errors related to the transaction (e.g., connection failure, constraint violation)
    // TODO: Log the error properly using a centralized logger
    console.log(error);
    return response.failure(internalServerError());
  }
};
