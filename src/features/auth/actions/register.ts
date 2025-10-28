'use server';

import { invalidFields } from '@/features/auth/lib/errors';
import { type RegisterInput, registerSchema } from '@/features/auth/schemas';
import { registerUser } from '@/features/auth/services';
import { type Response, response } from '@/lib/result';

/**
 * Register action - validates input and calls service
 * Always returns Response<T>, never throws
 */
export async function register(
  values: RegisterInput
): Promise<Response<{ userId: string }>> {
  // Validate input
  const validation = registerSchema.safeParse(values);
  if (!validation.success) {
    return response.error(invalidFields(validation.error.issues));
  }

  // Call service layer - it returns Response<T>
  return await registerUser(validation.data);
}
