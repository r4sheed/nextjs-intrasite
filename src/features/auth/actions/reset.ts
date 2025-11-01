'use server';

import { type Response, response } from '@/lib/response';

import { invalidFields } from '@/features/auth/lib/errors';
import { type ResetInput, resetSchema } from '@/features/auth/schemas';
import { resetPassword } from '@/features/auth/services';

export type ResetData = { email: string };

/**
 * Reset password action - validates input and calls service
 */
export const reset = async (
  values: ResetInput
): Promise<Response<ResetData>> => {
  const result = resetSchema.safeParse(values);
  if (!result.success) {
    return response.failure(invalidFields(result.error.issues));
  }

  return await resetPassword(result.data);
};
