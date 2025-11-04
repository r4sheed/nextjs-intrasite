'use server';

import { type Response, response } from '@/lib/response';

import { invalidFields } from '@/features/auth/lib/errors';
import { type LoginInput, loginSchema } from '@/features/auth/schemas';
import { loginUser as loginUserService } from '@/features/auth/services';

/**
 * Successful login response data containing the authenticated user's ID.
 */
export type LoginUserData = { userId: string; twoFactorRequired?: boolean };

/**
 * Server Action to authenticate a user with email and password credentials.
 *
 * This action validates the login input fields (email format, password requirements)
 * using the defined Zod schema, then delegates the authentication logic to the
 * service layer which handles credential verification, session creation, and
 * email verification checks.
 *
 * @param values - The user's login credentials (email and password).
 * @returns A Response object containing the user ID on success, or validation/authentication errors.
 */
export const loginUser = async (
  values: LoginInput
): Promise<Response<LoginUserData>> => {
  // Validate the input fields using the defined schema
  const result = loginSchema.safeParse(values);

  if (!result.success) {
    // Return early with specific field validation errors
    return response.failure(invalidFields(result.error.issues));
  }

  // Call the core service function to handle authentication logic
  return await loginUserService(result.data);
};
