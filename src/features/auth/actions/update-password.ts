'use server';

import { type Response, response } from '@/lib/response';

import { invalidFields } from '@/features/auth/lib/errors';

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
 *
 * @example
 * const result = await updatePassword({
 *   token: 'reset-token-123',
 *   password: 'newSecurePass123'
 * });
 * if (result.status === Status.Success) {
 *   console.log('Password updated successfully');
 * }
 */
export const updatePassword = async (
  values: NewPasswordInput
): Promise<Response<UpdatePasswordData>> => {
  // Validate the input fields against the defined schema
  const result = newPasswordSchema.safeParse(values);
  if (!result.success) {
    // Return early with specific field validation errors
    return response.failure(invalidFields(result.error.issues));
  }

  // Call the core service function to handle the business logic
  return await updatePasswordService(result.data);
};
