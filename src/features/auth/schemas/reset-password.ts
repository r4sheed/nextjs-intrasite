import { z } from 'zod';

import { AUTH_ERROR_MESSAGES } from '@/features/auth/lib/messages';

export const resetPasswordSchema = z.object({
  email: z.email({
    message: AUTH_ERROR_MESSAGES.INVALID_FIELDS,
  }),
});

export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
