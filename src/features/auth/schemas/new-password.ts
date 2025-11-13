import { z } from 'zod';

import { AUTH_ERRORS } from '@/features/auth/lib/strings';

import { passwordField } from './user-fields';

/**
 * Schema for setting new password with reset token
 * Validates email, reset token and new password
 */
export const newPasswordSchema = z.object({
  email: z.email({ message: AUTH_ERRORS.emailInvalid }),
  token: z
    .string({ message: AUTH_ERRORS.invalidFields })
    .min(1, { message: AUTH_ERRORS.tokenInvalid }),

  password: passwordField,
});

/**
 * Type for new password form data
 */
export type NewPasswordInput = z.infer<typeof newPasswordSchema>;
