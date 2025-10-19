'use server';

import { AuthErrorDefinitions as AuthErrors } from '@/features/auth/lib/errors';
import { type LoginInput, loginSchema } from '@/features/auth/schemas';
import { loginUser } from '@/features/auth/services';
import { type Response, failure } from '@/lib/response';

/**
 * Login action - validates input and calls service
 * Always returns Response<T>, never throws
 */
export async function login(
  values: LoginInput
): Promise<Response<{ userId: string }>> {
  // Validate input
  const validation = loginSchema.safeParse(values);
  if (!validation.success) {
    return failure(AuthErrors.INVALID_FIELDS(validation.error.issues));
  }

  // Call service layer - it returns Response<T>
  return await loginUser(validation.data);
}
