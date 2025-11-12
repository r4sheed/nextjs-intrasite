'use server';

import { z } from 'zod';

import { validationFailed } from '@/lib/errors';
import { type Response, response } from '@/lib/response';

import {
  type NewPasswordInput,
  newPasswordSchema,
} from '@/features/auth/schemas';
import { updatePassword as updatePasswordService } from '@/features/auth/services';

/**
 * Successful password update response data (empty object as no data is returned).
 */
export type UpdatePasswordData = Record<string, never>;

/**
 * Server Action to update a user's password using a valid reset token.
 *
 * This action validates the new password input (token and password) using the
 * defined Zod schema, then delegates the password reset logic to the service
 * layer which handles token validation, expiration checks, password hashing,
 * and atomic database updates.
 *
 * @param values - The password reset data containing the token and new password.
 * @returns A Response object indicating success or validation/reset errors.
 */
export const updatePassword = async (
  values: NewPasswordInput
): Promise<Response<UpdatePasswordData>> => {
  // Validate the input fields against the defined schema
  const validation = newPasswordSchema.safeParse(values);
  if (!validation.success) {
    // Return early with specific field validation errors
    return response.failure(validationFailed(z.treeifyError(validation.error)));
  }

  // Call the core service function to handle the business logic
  return await updatePasswordService(validation.data);
};
