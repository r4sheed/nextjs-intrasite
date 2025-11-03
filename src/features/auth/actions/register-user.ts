'use server';

import { type Response, response } from '@/lib/response';

import { invalidFields } from '@/features/auth/lib/errors';
import { type RegisterInput, registerSchema } from '@/features/auth/schemas';
import { registerUser as registerUserService } from '@/features/auth/services';

/**
 * Successful registration response data containing the newly created user's ID.
 */
export type RegisterUserData = { userId: string };

/**
 * Server Action to register a new user account.
 *
 * This action validates the registration input fields (email, password, name)
 * using the defined Zod schema, then delegates the user creation process to
 * the service layer which handles duplicate email checks, password hashing,
 * database persistence, and optional email verification flow.
 *
 * @param values - The user's registration data (email, password, name).
 * @returns A Response object containing the user ID on success, or validation/registration errors.
 */
export const registerUser = async (
  values: RegisterInput
): Promise<Response<RegisterUserData>> => {
  // Validate the input fields using the defined schema
  const result = registerSchema.safeParse(values);

  if (!result.success) {
    // Return early with specific field validation errors
    return response.failure(invalidFields(result.error.issues));
  }

  // Call the core service function to handle user creation and database persistence
  return await registerUserService(result.data);
};
