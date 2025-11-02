'use server';

import type { Response } from '@/lib/response';
import { response } from '@/lib/response';

import { invalidFields } from '@/features/auth/lib/errors';
import { setNewPassword } from '@/features/auth/services/new-password';

import type { NewPasswordInput } from '@/features/auth/schemas';
import { newPasswordSchema } from '@/features/auth/schemas';

export type NewPasswordData = {};

/**
 * Server Action to validate the new password input and execute the password reset service.
 *
 * This function ensures the input conforms to the schema before calling the core service.
 *
 * @param values - The new password input data (token and password).
 * @returns A Response object containing success status or validation/service error.
 */
export const newPassword = async (
  values: NewPasswordInput
): Promise<Response<NewPasswordData>> => {
  // Validate the input fields against the defined schema
  const result = newPasswordSchema.safeParse(values);
  if (!result.success) {
    // Return early with specific field validation errors
    return response.failure(invalidFields(result.error.issues));
  }

  // Call the core service function to handle the business logic
  return await setNewPassword(result.data);
};
