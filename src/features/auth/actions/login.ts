'use server';

import { type Response, response } from '@/lib/response';

import { invalidFields } from '@/features/auth/lib/errors';

import { type LoginInput, loginSchema } from '@/features/auth/schemas';
import { loginUser } from '@/features/auth/services';

export type LoginData = { userId: string };

/**
 * Server Action to handle user login.
 * It validates the input fields (email and password) and delegates the core
 * login process to the loginUser service.
 *
 * @param values - The user's login credentials (email and password).
 * @returns A Response object indicating success (with userId) or validation/service error.
 */
export const login = async (
  values: LoginInput
): Promise<Response<LoginData>> => {
  // Validate the input fields using the defined schema
  const result = loginSchema.safeParse(values);

  if (!result.success) {
    // Return early with specific field validation errors
    return response.failure(invalidFields(result.error.issues));
  }

  // Call the core service function to handle authentication logic
  return await loginUser(result.data);
};
