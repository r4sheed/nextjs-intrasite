import { z } from 'zod';

import { AUTH_ERROR_MESSAGES } from '@/features/auth/lib/messages';

export const newPasswordSchema = z.object({
  token: z
    .string({ message: AUTH_ERROR_MESSAGES.INVALID_FIELDS })
    .min(1, { message: AUTH_ERROR_MESSAGES.TOKEN_NOT_FOUND }),

  password: z
    .string({ message: AUTH_ERROR_MESSAGES.INVALID_FIELDS })
    .min(1, { message: AUTH_ERROR_MESSAGES.PASSWORD_REQUIRED })
    .min(8, { message: AUTH_ERROR_MESSAGES.PASSWORD_TOO_SHORT }),
});

export type NewPasswordInput = z.infer<typeof newPasswordSchema>;
