import { z } from 'zod';

import { AUTH_ERRORS } from '@/features/auth/lib/strings';

import { passwordField } from './user-fields';

export const newPasswordSchema = z.object({
  token: z
    .string({ message: AUTH_ERRORS.invalidFields })
    .min(1, { message: AUTH_ERRORS.tokenInvalid }),

  password: passwordField,
});

export type NewPasswordInput = z.infer<typeof newPasswordSchema>;
