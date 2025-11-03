'use server';

import { type Response, response } from '@/lib/response';

import { invalidFields } from '@/features/auth/lib/errors';
import { type ResetInput, resetSchema } from '@/features/auth/schemas';
import { resetPassword as resetPasswordService } from '@/features/auth/services';

/**
 * Successful password reset request response data (empty object as no data is returned).
 */
export type ResetPasswordData = Record<string, never>;

/**
 * Server Action to initiate a password reset request by email.
 *
 * This action validates the email input using the defined Zod schema, then
 * delegates the reset process to the service layer which handles user lookup,
 * token generation, and password reset email delivery. Returns a generic success
 * message to prevent email enumeration attacks, even if the user doesn't exist.
 *
 * @param values - The input containing the user's email address.
 * @returns A Response object containing success status or validation/service error.
 */
export const resetPassword = async (
  values: ResetInput
): Promise<Response<ResetPasswordData>> => {
  // Validate the input fields (email format)
  const result = resetSchema.safeParse(values);
  if (!result.success) {
    // Return early with specific field validation errors
    return response.failure(invalidFields(result.error.issues));
  }

  // Call the core service function which handles the business logic (token creation, email sending)
  return await resetPasswordService(result.data);
};
