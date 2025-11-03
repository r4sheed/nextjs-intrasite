import { z } from 'zod';

import { AUTH_ERRORS } from '@/features/auth/lib/strings';

export const newPasswordSchema = z.object({
  token: z
    .string({ message: AUTH_ERRORS.invalidFields })
    .min(1, { message: AUTH_ERRORS.tokenInvalid }),

  password: z
    .string({ message: AUTH_ERRORS.invalidFields })
    .min(1, { message: AUTH_ERRORS.passwordRequired })
    .min(8, { message: AUTH_ERRORS.passwordTooShort }),
});

export type NewPasswordInput = z.infer<typeof newPasswordSchema>;
