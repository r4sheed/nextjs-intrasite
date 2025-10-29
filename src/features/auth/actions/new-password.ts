'use server';

import { invalidFields, tokenNotFound } from '@/features/auth/lib/errors';
import { AUTH_UI_MESSAGES } from '@/features/auth/lib/messages';
import {
  type NewPasswordInput,
  newPasswordSchema,
} from '@/features/auth/schemas';
import { type Response, response } from '@/lib/result';

export type NewPasswordData = {};

/**
 * New Password action - validates input and calls service
 */
export const newPassword = async (
  values: NewPasswordInput
): Promise<Response<NewPasswordData>> => {
  const result = newPasswordSchema.safeParse(values);
  if (!result.success) {
    return response.error(invalidFields(result.error.issues));
  }

  return response.success({
    message: {
      key: AUTH_UI_MESSAGES.PASSWORD_UPDATED_SUCCESS,
    },
  });
};
