'use server';

import { type Response, response } from '@/lib/response';

import { invalidFields } from '@/features/auth/lib/errors';

import type { ResetInput } from '@/features/auth/schemas';
import { resetSchema } from '@/features/auth/schemas';
import { resetPassword } from '@/features/auth/services';

export type ResetData = { email: string };

/**
 * Server Action to handle the password reset request.
 * It validates the input and calls the core service to initiate the reset process (e.g., sending an email).
 *
 * @param values - The input containing the user's email address.
 * @returns A Response object containing success status or validation/service error.
 */
export const reset = async (
  values: ResetInput
): Promise<Response<ResetData>> => {
  // Validate the input fields (email format)
  const result = resetSchema.safeParse(values);
  if (!result.success) {
    // Return early with specific field validation errors
    return response.failure(invalidFields(result.error.issues));
  }

  // Call the core service function which handles the business logic (token creation, email sending)
  return await resetPassword(result.data);
};
