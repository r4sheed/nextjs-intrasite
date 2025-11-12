'use server';

import { validationFailed } from '@/lib/errors';
import { type Response, response } from '@/lib/response';

import { type LoginInput, loginSchema } from '@/features/auth/schemas';
import { loginUser as loginUserService } from '@/features/auth/services';

import type { LoginUserData } from '@/features/auth/services/login-user';

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
  const validation = loginSchema.safeParse(values);

  if (!validation.success) {
    // Return early with specific field validation errors
    return response.failure(validationFailed(validation.error));
  }

  // Call the core service function to handle authentication logic
  return await loginUserService(validation.data);
};
