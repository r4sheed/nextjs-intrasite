'use server';

import { type Response, response } from '@/lib/response';

import { invalidFields } from '@/features/auth/lib/errors';

import { type RegisterInput, registerSchema } from '@/features/auth/schemas';
import { registerUser } from '@/features/auth/services';

export type RegisterData = { userId: string };

/**
 * Server Action to handle user registration.
 * It validates the input fields (e.g., email, password, name) and delegates
 * the core registration and user creation process to the registerUser service.
 *
 * @param values - The user's registration data.
 * @returns A Response object indicating success (with userId) or validation/service error.
 */
export const register = async (
  values: RegisterInput
): Promise<Response<RegisterData>> => {
  // Validate the input fields using the defined schema
  const result = registerSchema.safeParse(values);

  if (!result.success) {
    // Return early with specific field validation errors
    return response.failure(invalidFields(result.error.issues));
  }

  // Call the core service function to handle user creation and database persistence
  return await registerUser(result.data);
};
