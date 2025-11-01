'use server';

import { type Response, response } from '@/lib/response';

import { invalidFields } from '@/features/auth/lib/errors';
import { type RegisterInput, registerSchema } from '@/features/auth/schemas';
import { registerUser } from '@/features/auth/services';

// Defines the expected successful data structure returned by the 'login' action.
export type RegisterData = { userId: string };

/**
 * Register action - validates input and calls service
 * Always returns Response<T>, never throws
 */
export async function register(
  values: RegisterInput
): Promise<Response<RegisterData>> {
  // Validate input
  const validation = registerSchema.safeParse(values);
  if (!validation.success) {
    return response.failure(invalidFields(validation.error.issues));
  }

  // Call service layer - it returns Response<T>
  return await registerUser(validation.data);
}
