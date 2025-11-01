'use server';

import { type Response, response } from '@/lib/response';

import { invalidFields } from '@/features/auth/lib/errors';
import { type LoginInput, loginSchema } from '@/features/auth/schemas';
import { loginUser } from '@/features/auth/services';

// Defines the expected successful data structure returned by the 'login' action.
export type LoginData = { userId: string };

/**
 * Login action - validates input and calls service
 * Always returns Response<T>, never throws
 */
export async function login(values: LoginInput): Promise<Response<LoginData>> {
  // Validate input
  const validation = loginSchema.safeParse(values);
  if (!validation.success) {
    return response.failure(invalidFields(validation.error.issues));
  }

  // Call service layer - it returns Response<T>
  return await loginUser(validation.data);
}
